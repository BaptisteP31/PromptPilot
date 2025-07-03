import { Router } from 'express';
import prisma from '../prisma/seed';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = Router();

// GET all ModelSystemPrompts (optionally filter by userId or modelslug)
router.get('/', authMiddleware, async (req, res) => {
  const { userId, modelslug } = req.query;
  try {
    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (modelslug) where.modelslug = String(modelslug);

    const prompts = await prisma.modelSystemPrompt.findMany({
      where,
      select: {
        id: true,
        modelslug: true,
        systemPromptId: true,
        name: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        systemPrompt: { select: { content: true } },
      },
    });
    // Ajout du champ systemPromptContent à plat
    const promptsWithContent = prompts.map(p => ({
      ...p,
      systemPromptContent: p.systemPrompt?.content || '',
    }));
    res.json(promptsWithContent);
  } catch (error) {
    console.error('Fetch ModelSystemPrompts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ModelSystemPrompt by id
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  try {
    const prompt = await prisma.modelSystemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'ModelSystemPrompt not found' });
    } else {
      res.json(prompt);
    }
  } catch (error) {
    console.error('Fetch ModelSystemPrompt by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new ModelSystemPrompt
router.post('/', authMiddleware, async (req, res) => {
  const { modelslug, systemPromptId, name, description } = req.body || {};
  const userId = (req as any).user?.id;

  const missingFields = [];
  if (!userId) missingFields.push('userId');
  if (!modelslug) missingFields.push('modelslug');
  if (!systemPromptId) missingFields.push('systemPromptId');
  if (!name) missingFields.push('name');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    return;
  }

  try {
    const newPrompt = await prisma.modelSystemPrompt.create({
      data: {
        modelslug,
        systemPromptId,
        name,
        description,
        userId,
      },
    });
    res.status(201).json(newPrompt);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Unique constraint failed (modelslug, systemPromptId, userId)' });
    } else {
      console.error('Create ModelSystemPrompt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT update ModelSystemPrompt by id
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body || {};
  const userId = (req as any).user?.id;

  try {
    // Check if the prompt exists and belongs to the user
    const prompt = await prisma.modelSystemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'ModelSystemPrompt not found' });
      return;
    }

    const updatedPrompt = await prisma.modelSystemPrompt.update({
      where: { id },
      data: {
        name,
        description,
      },
    });
    res.json(updatedPrompt);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'ModelSystemPrompt not found' });
    } else if (error.code === 'P2002') {
      res.status(409).json({ error: 'Unique constraint failed (modelslug, systemPromptId, userId)' });
    } else {
      console.error('Update ModelSystemPrompt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE ModelSystemPrompt by id
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id;
  try {
    // Check if the prompt exists and belongs to the user
    const prompt = await prisma.modelSystemPrompt.findUnique({ where: { id } });
    if (!prompt || prompt.userId !== userId) {
      res.status(404).json({ error: 'ModelSystemPrompt not found' });
      return;
    }
    await prisma.modelSystemPrompt.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'ModelSystemPrompt not found' });
    } else {
      console.error('Delete ModelSystemPrompt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
