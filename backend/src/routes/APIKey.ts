import { Router } from 'express';
import prisma from '../prisma/seed';
// import { adminMiddleware } from '../middlewares/adminMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware'; // Assumes you have this

const router = Router();

// GET all API keys for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const apiKeys = await prisma.aPIKey.findMany({
      where: { userId },
      include: { user: false, type: true },
    });
    res.json(apiKeys);
  } catch (error) {
    console.error('Fetch user API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET API key by id (only if it belongs to the user)
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid API key id' });
    return;
  }
  try {
    const userId = (req as any).user.id;
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id },
      include: { user: false, type: true },
    });
    if (!apiKey || apiKey.userId !== userId) {
      res.status(404).json({ error: 'API key not found' });
    } else {
      res.json(apiKey);
    }
  } catch (error) {
    console.error('Fetch API key by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new API key (user can only create for themselves)
router.post('/', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  const { typeId, apiKey } = req.body || {};
  const missingFields = [];
  if (!typeId) missingFields.push('typeId');
  if (!apiKey) missingFields.push('apiKey');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  } else {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(400).json({ error: 'Invalid userId: referenced user does not exist.' });
      }
      const newApiKey = await prisma.aPIKey.create({
        data: { userId, typeId, apiKey },
      });
      res.status(201).json(newApiKey);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('apiKey')) {
        res.status(409).json({ error: 'API key must be unique.' });
      } else if (error.code === 'P2003' && error.meta?.field_name?.includes('typeId')) {
        res.status(400).json({ error: 'Invalid typeId: referenced type does not exist.' });
      } else if (error.code === 'P2003' && error.meta?.field_name?.includes('userId')) {
        res.status(400).json({ error: 'Invalid userId: referenced user does not exist.' });
      } else {
        console.error('Create API key error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// PUT update API key by id (only if it belongs to the user)
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user.id;
  const { typeId, apiKey } = req.body || {};

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid API key id' });
  } else {
    const missingFields = [];
    if (!typeId) missingFields.push('typeId');
    if (!apiKey) missingFields.push('apiKey');

    if (missingFields.length > 0) {
      res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    } else {
      try {
        // Check ownership
        const existing = await prisma.aPIKey.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
          res.status(404).json({ error: 'API key not found' });
        }
        const updatedApiKey = await prisma.aPIKey.update({
          where: { id },
          data: { typeId, apiKey },
        });
        res.json(updatedApiKey);
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('apiKey')) {
          res.status(409).json({ error: 'API key must be unique.' });
        } else if (error.code === 'P2025') {
          res.status(404).json({ error: 'API key not found' });
        } else {
          console.error('Update API key error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    }
  }
});

// DELETE API key by id (only if it belongs to the user)
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = (req as any).user.id;
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid API key id' });
  } else {
    try {
      // Check ownership
      const existing = await prisma.aPIKey.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: 'API key not found' });
      }
      await prisma.aPIKey.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'API key not found' });
      } else {
        console.error('Delete API key error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

export default router;
