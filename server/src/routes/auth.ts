import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { signToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  roles: true,
  activeMode: true,
  createdAt: true,
  customerProfile: true,
  sellerProfile: { include: { shops: { include: { location: true } } } },
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, initialRole } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const role: Role = initialRole === 'SELLER' ? Role.SELLER : Role.CUSTOMER;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          roles: [role],
          activeMode: role === Role.SELLER ? 'SELLER' : 'CUSTOMER',
        },
      });

      if (role === Role.CUSTOMER) {
        await tx.customerProfile.create({ data: { userId: newUser.id } });
      } else {
        await tx.sellerProfile.create({ data: { userId: newUser.id } });
      }

      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email, roles: user.roles });
    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect });

    res.status(201).json({ token, user: fullUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, email: user.email, roles: user.roles });
    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect });

    res.json({ token, user: fullUser });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!user) return res.json({ message: 'If that email is registered, a reset link is ready.' });

  const token = jwt.sign({ userId: user.id, purpose: 'password-reset' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  res.json({ message: 'Password reset link is ready.', resetToken: token });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || String(password).length < 8) {
    return res.status(400).json({ error: 'A valid token and password of at least 8 characters are required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string; purpose: string };
    if (payload.purpose !== 'password-reset') return res.status(400).json({ error: 'Invalid reset link' });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: payload.userId }, data: { passwordHash } });
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(400).json({ error: 'This reset link is invalid or expired' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: userSelect,
  });
  res.json(user);
});

router.post('/add-role', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'SELLER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.roles.includes(role as Role)) {
      return res.status(400).json({ error: 'Role already assigned' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { roles: { push: role as Role } },
      });

      if (role === 'CUSTOMER') {
        await tx.customerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      } else {
        await tx.sellerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      }
    });

    const updated = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to add role' });
  }
});

router.patch('/switch-mode', authenticate, async (req: AuthRequest, res: Response) => {
  const { mode } = req.body;
  if (!['CUSTOMER', 'SELLER'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user?.roles.includes(mode as Role)) {
    return res.status(403).json({ error: 'You do not have this role' });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { activeMode: mode },
    select: userSelect,
  });
  res.json(updated);
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, phone, avatarUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, phone, avatarUrl },
    select: userSelect,
  });
  res.json(updated);
});

export default router;
