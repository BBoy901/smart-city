import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.post('/preferences', authenticate, async (req: AuthRequest, res: Response) => {
  const { categoryIds } = req.body;
  if (!Array.isArray(categoryIds)) {
    return res.status(400).json({ error: 'categoryIds must be an array' });
  }

  await prisma.$transaction([
    prisma.userPreference.deleteMany({ where: { userId: req.user!.id } }),
    ...categoryIds.map((categoryId: string) =>
      prisma.userPreference.create({ data: { userId: req.user!.id, categoryId } })
    ),
  ]);

  const prefs = await prisma.userPreference.findMany({
    where: { userId: req.user!.id },
    include: { category: true },
  });
  res.json(prefs);
});

router.get('/preferences', authenticate, async (req: AuthRequest, res: Response) => {
  const prefs = await prisma.userPreference.findMany({
    where: { userId: req.user!.id },
    include: { category: true },
  });
  res.json(prefs);
});

export default router;
