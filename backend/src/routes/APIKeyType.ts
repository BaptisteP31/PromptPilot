import { Router } from 'express';
import prisma from '../prisma/seed';

import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// GET all API key types
router.get('/', async (req, res) => {
  try {
    const APIKeyTypes = await prisma.aPIKeyType.findMany();
    res.json(APIKeyTypes);
  } catch (error) {
    console.error('Fetch API key types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
