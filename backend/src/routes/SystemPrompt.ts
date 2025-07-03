import { Router } from 'express';
import prisma from '../prisma/seed';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
const router = Router();

// GET all system prompts (optionally filter by userId)
router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req.query;
  try {
    const where = userId ? { userId: Number(userId) } : {};
    const prompts = await prisma.systemPrompt.findMany({
      where,
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(prompts);
  } catch (error) {
    console.error('Fetch system prompts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET system prompt by id
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  try {
    const prompt = await prisma.systemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'SystemPrompt not found' });
    } else {
      res.json(prompt);
    }
  } catch (error) {
    console.error('Fetch system prompt by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new system prompt
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, content } = req.body || {};
  const userId = (req as any).user?.id;

  const missingFields = [];
  if (!userId) missingFields.push('userId');
  if (!name) missingFields.push('name');
  if (!content) missingFields.push('content');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    return;
  }

  try {
    const newPrompt = await prisma.systemPrompt.create({
      data: {
        userId,
        name,
        description,
        content,
      },
    });
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Create system prompt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update system prompt by id
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, content } = req.body || {};
  const userId = (req as any).user?.id;

  try {
    // Check if the prompt exists and belongs to the user
    const prompt = await prisma.systemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'SystemPrompt not found' });
    }

    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        name,
        description,
        content,
      },
    });
    res.json(updatedPrompt);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'SystemPrompt not found' });
    } else {
      console.error('Update system prompt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE system prompt by id
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  try {
    // Check if the prompt exists and belongs to the user
    const prompt = await prisma.systemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'SystemPrompt not found' });
      return;
    }
    await prisma.systemPrompt.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'SystemPrompt not found' });
    } else {
      console.error('Delete system prompt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
