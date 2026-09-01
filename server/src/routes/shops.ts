import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '@prisma/client';

const router = Router();

router.get('/:id', async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: {
      location: true,
      sellerProfile: { include: { user: { select: { id: true, name: true, phone: true, avatarUrl: true } } } },
      shopCategories: { include: { category: true } },
      products: {
        where: { isActive: true },
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!shop || !shop.isActive) return res.status(404).json({ error: 'Shop not found' });

  await prisma.shop.update({ where: { id: shop.id }, data: { viewCount: { increment: 1 } } });
  res.json(shop);
});

router.get('/seller/:sellerId', async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: req.params.sellerId },
    include: {
      user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      shops: {
        where: { isActive: true },
        include: {
          location: true,
          shopCategories: { include: { category: true } },
          products: { where: { isActive: true }, include: { images: true }, take: 12 },
        },
      },
    },
  });

  if (!seller) return res.status(404).json({ error: 'Seller not found' });
  res.json(seller);
});

router.post('/', authenticate, requireRole(Role.SELLER), upload.single('logo'), async (req: AuthRequest, res: Response) => {
  try {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ error: 'Seller profile not found' });

    const { name, description, phone, businessHours, categoryIds } = req.body;
    const file = req.file;

    const shop = await prisma.shop.create({
      data: {
        sellerProfileId: seller.id,
        name,
        description,
        phone,
        businessHours,
        logoUrl: file ? `/uploads/${file.filename}` : null,
      },
    });

    if (categoryIds) {
      const ids = JSON.parse(categoryIds);
      await prisma.shopCategory.createMany({
        data: ids.map((categoryId: string) => ({ shopId: shop.id, categoryId })),
      });
    }

    const result = await prisma.shop.findUnique({
      where: { id: shop.id },
      include: { location: true, shopCategories: { include: { category: true } } },
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

router.patch('/:id', authenticate, requireRole(Role.SELLER), upload.single('logo'), async (req: AuthRequest, res: Response) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: { sellerProfile: true },
  });
  if (!shop || shop.sellerProfile.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  const { name, description, phone, businessHours, categoryIds } = req.body;
  const file = req.file;

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      name: name ?? shop.name,
      description: description ?? shop.description,
      phone: phone ?? shop.phone,
      businessHours: businessHours ?? shop.businessHours,
      logoUrl: file ? `/uploads/${file.filename}` : shop.logoUrl,
    },
  });

  if (categoryIds) {
    const ids = JSON.parse(categoryIds);
    await prisma.shopCategory.deleteMany({ where: { shopId: shop.id } });
    await prisma.shopCategory.createMany({
      data: ids.map((categoryId: string) => ({ shopId: shop.id, categoryId })),
    });
  }

  const result = await prisma.shop.findUnique({
    where: { id: shop.id },
    include: { location: true, shopCategories: { include: { category: true } } },
  });
  res.json(result);
});

router.post('/:id/location', authenticate, requireRole(Role.SELLER), async (req: AuthRequest, res: Response) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: { sellerProfile: true },
  });
  if (!shop || shop.sellerProfile.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  const { area, city, region, country, street, building, floor, shopNumber, latitude, longitude } = req.body;

  const location = await prisma.location.upsert({
    where: { shopId: shop.id },
    create: {
      shopId: shop.id,
      area,
      city: city || 'Dar es Salaam',
      region: region || 'Dar es Salaam',
      country: country || 'Tanzania',
      street,
      building,
      floor,
      shopNumber,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
    update: {
      area,
      city,
      region,
      country,
      street,
      building,
      floor,
      shopNumber,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
  });

  res.json(location);
});

router.get('/my/shops', authenticate, requireRole(Role.SELLER), async (req: AuthRequest, res: Response) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user!.id },
    include: {
      shops: {
        include: {
          location: true,
          shopCategories: { include: { category: true } },
          _count: { select: { products: true } },
        },
      },
    },
  });
  res.json(seller?.shops || []);
});

export default router;
