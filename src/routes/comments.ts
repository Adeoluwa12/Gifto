import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { authenticate, adminOrSuperAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Add comment to post (public - can be anonymous or logged in)
router.post('/', [
  body('post').isMongoId().withMessage('Valid post ID is required'),
  body('authorName').trim().isLength({ min: 1 }).withMessage('Author name is required'),
  body('authorEmail').optional().isEmail().normalizeEmail(),
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required'),
  body('parentComment').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { post, authorName, authorEmail, content, parentComment } = req.body;

    // Verify post exists
    const postDoc = await Post.findById(post);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post,
      authorName,
      authorEmail,
      content,
      parentComment: parentComment || null
    });

    await comment.save();

    // If it's a reply, add to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } }
      );
    }

    res.status(201).json({
      message: 'Comment submitted for review',
      comment: {
        id: comment._id,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: (comment as any).createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post (public - only approved comments)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId, 
      isApproved: true,
      parentComment: null 
    })
      .populate({
        path: 'replies',
        match: { isApproved: true },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending comments (admin only)
router.get('/pending', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ isApproved: false })
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ isApproved: false });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all comments (admin only)
router.get('/', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['approved', 'pending']),
  query('post').optional().isMongoId()
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
    
    if (req.query.status === 'approved') {
      filter.isApproved = true;
    } else if (req.query.status === 'pending') {
      filter.isApproved = false;
    }
    
    if (req.query.post) {
      filter.post = req.query.post;
    }

    const comments = await Comment.find(filter)
      .populate('post', 'title slug')
      .populate('parentComment', 'authorName content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject comment (admin only)
router.put('/:id/approve', authenticate, adminOrSuperAdmin, [
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isApproved = req.body.isApproved;
    await comment.save();

    res.json({ 
      message: `Comment ${req.body.isApproved ? 'approved' : 'rejected'}`, 
      comment 
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment (admin only)
router.delete('/:id', authenticate, adminOrSuperAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comment statistics (admin only)
router.get('/stats', authenticate, adminOrSuperAdmin, async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const approvedComments = await Comment.countDocuments({ isApproved: true });
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    
    // Comments this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const commentsThisMonth = await Comment.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      totalComments,
      approvedComments,
      pendingComments,
      commentsThisMonth
    });
  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;