import express from 'express';
import { body, validationResult, query } from 'express-validator';
import User from '../models/User';
import Post from '../models/Post';
import CommunityMember from '../models/CommunityMember';
import Comment from '../models/Comment';
import Submission from '../models/Submission';
import { authenticate, adminOrSuperAdmin, superAdminOnly } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/dashboard', authenticate, adminOrSuperAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const totalMembers = await CommunityMember.countDocuments({ isActive: true });
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });

    // Recent activity
    const recentPosts = await Post.find()
      .populate('category', 'name')
      .populate('author', 'email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    const recentMembers = await CommunityMember.find({ isActive: true })
      .sort({ joinedAt: -1 })
      .limit(5)
      .select('name email joinedAt');

    res.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalMembers,
        pendingComments,
        pendingSubmissions
      },
      recentActivity: {
        recentPosts,
        recentMembers
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all community members (admin only)
router.get('/members', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    let filter: any = {};
    
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const members = await CommunityMember.find(filter)
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CommunityMember.countDocuments(filter);

    res.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manage member status (admin only)
router.put('/members/:id', authenticate, adminOrSuperAdmin, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await CommunityMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.isActive = req.body.isActive;
    await member.save();

    res.json({ message: 'Member status updated', member });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admin users (super admin only)
router.get('/users', authenticate, superAdminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all authors (admin and above)
router.get('/authors', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    let filter: any = { role: 'author' };
    
    if (search) {
      filter = {
        ...filter,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const authors = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    // Get post counts for each author
    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const postCount = await Post.countDocuments({ author: author._id });
        const publishedCount = await Post.countDocuments({ 
          author: author._id, 
          status: 'published' 
        });
        
        return {
          ...author.toJSON(),
          stats: {
            totalPosts: postCount,
            publishedPosts: publishedCount
          }
        };
      })
    );

    res.json({
      authors: authorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (admin view with all statuses)
router.get('/posts', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('author').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const posts = await Post.find(filter)
      .populate('category', 'name slug')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude content for list view

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate admin user (super admin only)
router.put('/users/:id/deactivate', authenticate, superAdminOnly, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot deactivate super admin' });
    }

    if (user._id.toString() === req.user!._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate yourself' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete admin user (super admin only)
router.delete('/users/:id', authenticate, superAdminOnly, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot delete super admin' });
    }

    if (user._id.toString() === req.user!._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;