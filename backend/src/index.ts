import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Routes
import fileRoutes from './routes/files';
import transactionRoutes from './routes/transactions';
import aiRoutes from './routes/ai';
import walletRoutes from './routes/wallet';
import mpesaRoutes from './routes/mpesa';

app.use('/api/files', fileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/mpesa', mpesaRoutes);

// Health check
app.get('/health', async (req, res) => {
  // Test database connection
  let dbStatus = 'unknown';
  try {
    const { prisma } = await import('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

app.listen(PORT, () => {
  console.log(` NegoSafe backend running on port ${PORT}`);
});