import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ROUTES
import authRoutes from './routes/auth';
import apiKeyRouter from './routes/APIKeyType';
import apiKeyRoutes from './routes/APIKey';
import modelRoutes from './routes/Model';
import systemPromptRoutes from './routes/SystemPrompt';
import modelSystemPromptRoutes from './routes/ModelSystemPrompt';

// MIDDLEWARES
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api-key-type', apiKeyRouter);
app.use('/api-key', authMiddleware, apiKeyRoutes);
app.use('/model', authMiddleware, modelRoutes);
app.use('/system-prompt', authMiddleware, systemPromptRoutes);
app.use('/model-system-prompt', authMiddleware, modelSystemPromptRoutes);

// /ping route
app.get('/ping', (_, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
