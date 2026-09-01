import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: true,
  shop: {
    include: {
      location: true,
      sellerProfile: { include: { user: { select: { id: true, name: true, phone: true } } } },
    },
  },
};

async function enrichProducts(products: any[], userId?: string) {
  if (!userId) return products.map((p) => ({ ...p, isLiked: false, isSaved: false }));

  const ids = products.map((p) => p.id);
  const [likes, saves] = await Promise.all([
    prisma.like.findMany({ where: { userId, productId: { in: ids } } }),
    prisma.savedProduct.findMany({ where: { userId, productId: { in: ids } } }),
  ]);

  const likedSet = new Set(likes.map((l) => l.productId));
  const savedSet = new Set(saves.map((s) => s.productId));

  return products.map((p) => ({
    ...p,
    isLiked: likedSet.has(p.id),
    isSaved: savedSet.has(p.id),
  }));
}

router.get('/feed', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { section = 'for-you', limit = 20, offset = 0 } = req.query;
  const take = Math.min(Number(limit), 50);
  const skip = Number(offset);

  let where: Prisma.ProductWhereInput = { isActive: true };
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

  if (section === 'trending') {
    orderBy = { viewCount: 'desc' };
  } else if (section === 'new') {
    orderBy = { createdAt: 'desc' };
  } else if (section === 'popular') {
    orderBy = { likeCount: 'desc' };
  } else if (req.user) {
    const prefs = await prisma.userPreference.findMany({
      where: { userId: req.user.id },
      select: { categoryId: true },
    });
    if (prefs.length > 0) {
      where = { ...where, categoryId: { in: prefs.map((p) => p.categoryId) } };
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
    take,
    skip,
  });

  res.json(await enrichProducts(products, req.user?.id));
});

router.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { q, category, area, minPrice, maxPrice, availability, type = 'all', limit = 20, offset = 0 } = req.query;

  if (!q && !category && !area) {
    return res.status(400).json({ error: 'Search query or filters required' });
  }

  if (q) {
    await prisma.searchLog.create({
      data: {
        userId: req.user?.id,
        query: String(q),
        filters: JSON.stringify({ category, area, minPrice, maxPrice, availability }),
      },
    });
  }

  const take = Math.min(Number(limit), 50);
  const skip = Number(offset);

  const productWhere: Prisma.ProductWhereInput = { isActive: true };
  if (q) {
    productWhere.OR = [
      { name: { contains: String(q), mode: 'insensitive' } },
      { description: { contains: String(q), mode: 'insensitive' } },
    ];
  }
  if (category) productWhere.categoryId = String(category);
  if (availability) productWhere.availability = availability as any;
  if (minPrice || maxPrice) {
    productWhere.price = {};
    if (minPrice) productWhere.price.gte = Number(minPrice);
    if (maxPrice) productWhere.price.lte = Number(maxPrice);
  }
  if (area) {
    productWhere.shop = { location: { area: { contains: String(area), mode: 'insensitive' } } };
  }

  const results: { products?: any[]; sellers?: any[] } = {};

  if (type === 'all' || type === 'products') {
    const products = await prisma.product.findMany({
      where: productWhere,
      include: productInclude,
      take,
      skip,
      orderBy: { viewCount: 'desc' },
    });
    results.products = await enrichProducts(products, req.user?.id);
  }

  if (type === 'all' || type === 'sellers') {
    const shopWhere: Prisma.ShopWhereInput = { isActive: true };
    if (q) {
      shopWhere.OR = [
        { name: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } },
      ];
    }
    if (area) {
      shopWhere.location = { area: { contains: String(area), mode: 'insensitive' } };
    }

    results.sellers = await prisma.shop.findMany({
      where: shopWhere,
      include: {
        location: true,
        sellerProfile: { include: { user: { select: { id: true, name: true, phone: true } } } },
        products: { where: { isActive: true }, take: 4, include: { images: true } },
        shopCategories: { include: { category: true } },
      },
      take,
      skip,
    });
  }

  res.json(results);
});

router.get('/user/liked', authenticate, async (req: AuthRequest, res: Response) => {
  const likes = await prisma.like.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(likes.map((l) => ({ ...l.product, isLiked: true })));
});

router.get('/user/saved', authenticate, async (req: AuthRequest, res: Response) => {
  const saves = await prisma.savedProduct.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(saves.map((s) => ({ ...s.product, isSaved: true })));
});

router.get('/user/recent', authenticate, async (req: AuthRequest, res: Response) => {
  const recent = await prisma.recentlyViewed.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: productInclude } },
    orderBy: { viewedAt: 'desc' },
    take: 20,
  });
  res.json(recent.map((r) => r.product));
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: productInclude,
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Product not found' });
  }

  await prisma.$transaction([
    prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }),
    prisma.productView.create({ data: { productId: product.id, userId: req.user?.id } }),
  ]);

  if (req.user) {
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId: req.user.id, productId: product.id } },
      create: { userId: req.user.id, productId: product.id },
      update: { viewedAt: new Date() },
    });
  }

  const [enriched] = await enrichProducts([product], req.user?.id);

  const related = await prisma.product.findMany({
    where: { shopId: product.shopId, isActive: true, id: { not: product.id } },
    include: productInclude,
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ product: enriched, relatedProducts: await enrichProducts(related, req.user?.id) });
});

router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  const productId = req.params.id;
  const existing = await prisma.like.findUnique({
    where: { userId_productId: { userId: req.user!.id, productId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.product.update({ where: { id: productId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return res.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId: req.user!.id, productId } }),
    prisma.product.update({ where: { id: productId }, data: { likeCount: { increment: 1 } } }),
  ]);
  res.json({ liked: true });
});

router.post('/:id/save', authenticate, async (req: AuthRequest, res: Response) => {
  const productId = req.params.id;
  const existing = await prisma.savedProduct.findUnique({
    where: { userId_productId: { userId: req.user!.id, productId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.savedProduct.delete({ where: { id: existing.id } }),
      prisma.product.update({ where: { id: productId }, data: { saveCount: { decrement: 1 } } }),
    ]);
    return res.json({ saved: false });
  }

  await prisma.$transaction([
    prisma.savedProduct.create({ data: { userId: req.user!.id, productId } }),
    prisma.product.update({ where: { id: productId }, data: { saveCount: { increment: 1 } } }),
  ]);
  res.json({ saved: true });
});

export default router;
