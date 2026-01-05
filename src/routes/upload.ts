import express from 'express';
import { authenticate, authorOrAbove } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// Upload image (authors who are users and above)
router.post('/image', authenticate, authorOrAbove, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;