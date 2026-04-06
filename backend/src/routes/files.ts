import express from 'express';
import multer from 'multer';
import { uploadFile, getFile, deleteFile } from '../services/fileService';
import { aiVerification } from '../services/aiService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Upload file with AI verification
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { sellerAddress } = req.body;
    if (!sellerAddress) {
      return res.status(400).json({ error: 'Seller address required' });
    }

    // Upload to IPFS
    const fileHash = await uploadFile(req.file.buffer, req.file.originalname);
    
    // Run AI verification
    const aiReport = await aiVerification(req.file.buffer, req.file.originalname);
    
    res.json({
      success: true,
      fileHash,
      aiReport,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get file metadata
router.get('/:hash', async (req, res) => {
  try {
    const fileData = await getFile(req.params.hash);
    res.json(fileData);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete file (if not yet in transaction)
router.delete('/:hash', async (req, res) => {
  try {
    await deleteFile(req.params.hash);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

export default router;