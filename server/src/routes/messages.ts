import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.user!.id } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, roles: true } } },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const enriched = await Promise.all(conversations.map(async (c) => {
    const other = c.participants.find((p) => p.userId !== req.user!.id);
    const lastMessage = c.messages[0];
    const unreadCount = await prisma.message.count({
      where: { conversationId: c.id, senderId: { not: req.user!.id }, isRead: false },
    });
    const messageCount = await prisma.message.count({ where: { conversationId: c.id } });
    const sentCount = await prisma.message.count({ where: { conversationId: c.id, senderId: req.user!.id } });
    return {
      id: c.id,
      otherUser: other?.user,
      lastMessage,
      unreadCount,
      messageCount,
      sentCount,
      lastMessageAt: lastMessage?.createdAt || c.updatedAt,
      updatedAt: c.updatedAt,
    };
  }));

  res.json(enriched);
});

router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  const { recipientId } = req.body;
  if (!recipientId) return res.status(400).json({ error: 'Recipient required' });
  if (recipientId === req.user!.id) return res.status(400).json({ error: 'Cannot message yourself' });

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: req.user!.id } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  if (existing) return res.json(existing);

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: req.user!.id }, { userId: recipientId }],
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  res.status(201).json(conversation);
});

router.get('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: String(req.params.id), userId: req.user!.id } },
  });
  if (!participant) return res.status(403).json({ error: 'Not a participant' });

  const messages = await prisma.message.findMany({
    where: { conversationId: String(req.params.id) },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.message.updateMany({
    where: { conversationId: String(req.params.id), senderId: { not: req.user!.id }, isRead: false },
    data: { isRead: true },
  });

  res.json(messages);
});

router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: String(req.params.id), userId: req.user!.id } },
  });
  if (!participant) return res.status(403).json({ error: 'Not a participant' });

  const message = await prisma.message.create({
    data: { conversationId: String(req.params.id), senderId: req.user!.id, content: content.trim() },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await prisma.conversation.update({
    where: { id: String(req.params.id) },
    data: { updatedAt: new Date() },
  });

  res.status(201).json(message);
});

export default router;
