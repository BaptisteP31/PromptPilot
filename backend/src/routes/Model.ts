import { Router } from 'express';
import prisma from '../prisma/seed';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
const router = Router();

// GET all models
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const models = await prisma.model.findMany({
      select: {
        slug: true,
        name: true,
        contextLength: true,
        cost_inputMil: true,
        cost_outputMil: true,
        cost_inputImg: true,
        cost_outputImg: true,
        description: true,
      },
    });
    res.json(models);
  } catch (error) {
    console.error('Fetch models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET model by slug
router.get('/:slug', authMiddleware, async (req, res) => {
  const { slug } = req.params;
  try {
    const model = await prisma.model.findUnique({ where: { slug } });
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
    } else {
      res.json(model);
    }
  } catch (error) {
    console.error('Fetch model by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new model
router.post('/', adminMiddleware, async (req, res) => {
  const {
    slug,
    name,
    contextLength,
    cost_inputMil,
    cost_outputMil,
    cost_inputImg,
    cost_outputImg,
    description,
  } = req.body || {};

  const missingFields = [];
  if (!slug) missingFields.push('slug');
  if (!name) missingFields.push('name');
  if (contextLength === undefined) missingFields.push('contextLength');
  if (cost_inputMil === undefined) missingFields.push('cost_inputMil');
  if (cost_outputMil === undefined) missingFields.push('cost_outputMil');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    return;
  }

  try {
    const newModel = await prisma.model.create({
      data: {
        slug,
        name,
        contextLength,
        cost_inputMil,
        cost_outputMil,
        cost_inputImg,
        cost_outputImg,
        description,
      },
    });
    res.status(201).json(newModel);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      res.status(409).json({ error: 'Model slug must be unique.' });
    } else {
      console.error('Create model error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT update model by modelslug in body
router.put('/', adminMiddleware, async (req, res) => {
  const {
    modelslug,
    name,
    contextLength,
    cost_inputMil,
    cost_outputMil,
    cost_inputImg,
    cost_outputImg,
    description,
  } = req.body || {};

  if (!modelslug) {
    res.status(400).json({ error: 'Missing field: modelslug' });
    return;
  }

  try {
    const updatedModel = await prisma.model.update({
      where: { slug: modelslug },
      data: {
        name,
        contextLength,
        cost_inputMil,
        cost_outputMil,
        cost_inputImg,
        cost_outputImg,
        description,
      },
    });
    res.json(updatedModel);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Model not found' });
    } else {
      console.error('Update model error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE model by slug
router.delete('/:slug', adminMiddleware, async (req, res) => {
  const { slug } = req.params;
  try {
    await prisma.model.delete({ where: { slug } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Model not found' });
    } else {
      console.error('Delete model error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
