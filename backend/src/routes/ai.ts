import express from 'express';
import multer from 'multer';
import { aiVerification } from '../services/aiService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// AI Verification endpoint
router.post('/verify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const report = await aiVerification(req.file.buffer, req.file.originalname);
    
    res.json({
      success: true,
      aiReport: report,
      fileHash: `ipfs_${Date.now()}_${req.file.originalname}`
    });
  } catch (error) {
    console.error('AI verification error:', error);
    res.status(500).json({ error: 'AI verification failed' });
  }
});

// Get AI report by file hash
router.get('/report/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Mock AI report
    const report = {
      fileType: 'pdf',
      wordCount: 1500,
      riskScore: 15,
      suggestedPrice: 50,
      keywords: ['contract', 'agreement', 'terms'],
      verified: true
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI report' });
  }
});

export default router;