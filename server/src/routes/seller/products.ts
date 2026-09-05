import cloudinary from '../../lib/cloudinary';
import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { Role } from '@prisma/client';

const router = Router();

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: true,
  shop: { include: { location: true } },
};

router.get('/my', authenticate, requireRole(Role.SELLER), async (req: AuthRequest, res: Response) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: req.user!.id },
    include: { shops: { select: { id: true } } },
  });
  if (!seller) return res.status(404).json({ error: 'Seller profile not found' });

  const shopIds = seller.shops.map((s) => s.id);
  const products = await prisma.product.findMany({
    where: { shopId: { in: shopIds } },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

router.post('/', authenticate, requireRole(Role.SELLER), upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    const { shopId, name, description, price, categoryId, availability, videoUrl } = req.body;
    if (!shopId || !name) {
      return res.status(400).json({ error: 'Shop and product name are required' });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { shops: true },
    });
    if (!seller?.shops.some((s) => s.id === shopId)) {
      return res.status(403).json({ error: 'Shop not found or not owned by you' });
    }

    const files = req.files as Express.Multer.File[];

const uploadedImages = files?.length
  ? await Promise.all(
      files.map(
        (file) =>
          new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'smart-city/products',
                resource_type: 'auto',
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

            stream.end(file.buffer);
          })
      )
    )
  : [];
    const product = await prisma.product.create({
      data: {
        shopId,
        name,
        description,
        price: price ? Number(price) : null,
        categoryId: categoryId || null,
        availability: availability || 'IN_STOCK',
        videoUrl: videoUrl || null,
        images: files?.length
          ? {
              create: files.map((f, i) => ({
                url: uploadedImages[i].secure_url,
                isPrimary: i === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/:id', authenticate, requireRole(Role.SELLER), upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: { shop: { include: { sellerProfile: true } } },
    });
    if (!product || product.shop.sellerProfile.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, categoryId, availability, videoUrl, isActive } = req.body;
const files = req.files as Express.Multer.File[];

const uploadedImages = files?.length
  ? await Promise.all(
      files.map(
        (file) =>
          new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'smart-city/products',
                resource_type: 'auto',
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

            stream.end(file.buffer);
          })
      )
    )
  : [];

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: name ?? product.name,
        description: description ?? product.description,
        price: price !== undefined ? Number(price) : product.price,
        categoryId: categoryId ?? product.categoryId,
        availability: availability ?? product.availability,
        videoUrl: videoUrl ?? product.videoUrl,
        isActive: isActive !== undefined ? isActive === 'true' || isActive === true : product.isActive,
      },
      include: productInclude,
    });

    if (files?.length) {
      await prisma.productImage.createMany({
        data: files.map((f, i) => ({
          productId: product.id,
          url: uploadedImages[i].secure_url,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      });
    }

    const result = await prisma.product.findUnique({ where: { id: product.id }, include: productInclude });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticate, requireRole(Role.SELLER), async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: String(req.params.id) },
    include: { shop: { include: { sellerProfile: true } } },
  });
  if (!product || product.shop.sellerProfile.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Product not found' });
  }

  await prisma.product.delete({ where: { id: product.id } });
  res.json({ success: true });
});

export { router as sellerProductRoutes };
