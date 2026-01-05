import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Post from '../models/Post';
import { authenticate, authorOrAbove } from '../middleware/auth';
import { AuthRequest } from '../types';
import upload from '../middleware/upload';

const router = express.Router();

// Get user profile (public)
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get user's published posts
    const posts = await Post.find({ 
      author: user._id, 
      status: 'published' 
    })
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(10);

    // Get user stats
    const totalPosts = await Post.countDocuments({ 
      author: user._id, 
      status: 'published' 
    });

    const totalDownloads = await Post.aggregate([
      { $match: { author: user._id, status: 'published' } },
      { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
    ]);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        createdAt: user.createdAt
      },
      posts,
      stats: {
        totalPosts,
        totalDownloads: totalDownloads[0]?.totalDownloads || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own profile (authenticated users)
router.put('/me', authenticate, authorOrAbove, upload.single('profileImage'), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('bio').optional().trim(),
  body('socialLinks').optional().isObject()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { name, bio, socialLinks } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = socialLinks;

    // Handle profile image upload
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get own profile (authenticated)
router.get('/me/profile', authenticate, authorOrAbove, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;