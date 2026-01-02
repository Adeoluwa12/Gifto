import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Submission from '../models/Submission';
import Post from '../models/Post';
import Category from '../models/Category';
import { authenticate, adminOrSuperAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';
import emailService from '../utils/email';

const router = express.Router();

// Submit story (public)
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('authorName').trim().isLength({ min: 1 }).withMessage('Author name is required'),
  body('authorEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('category').isIn(['short-stories', 'personal-essays', 'think-pieces', 'articles', 'non-fiction'])
    .withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, authorName, authorEmail, category } = req.body;

    const submission = new Submission({
      title,
      content,
      authorName,
      authorEmail,
      category
    });

    await submission.save();

    // Send confirmation email
    try {
      await emailService.sendSubmissionConfirmation(authorName, authorEmail, title);
    } catch (emailError) {
      console.error('Submission confirmation email failed:', emailError);
      // Don't fail the submission if email fails
    }

    res.status(201).json({
      message: 'Submission received successfully! We will review it and get back to you.',
      submission: {
        id: submission._id,
        title: submission.title,
        authorName: submission.authorName,
        category: submission.category,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error('Submit story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all submissions (admin only)
router.get('/', authenticate, adminOrSuperAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('category').optional().isIn(['short-stories', 'personal-essays', 'think-pieces', 'articles', 'non-fiction'])
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
    
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const submissions = await Submission.find(filter)
      .populate('reviewedBy', 'email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single submission (admin only)
router.get('/:id', authenticate, adminOrSuperAdmin, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('reviewedBy', 'email');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review submission (admin only)
router.put('/:id/review', authenticate, adminOrSuperAdmin, [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const { status, notes } = req.body;

    submission.status = status;
    submission.reviewedBy = req.user!._id;
    submission.reviewedAt = new Date();
    if (notes) submission.notes = notes;

    await submission.save();

    res.json({
      message: `Submission ${status}`,
      submission
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Convert approved submission to post (admin only)
router.post('/:id/convert-to-post', authenticate, adminOrSuperAdmin, [
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('tags').optional().isArray(),
  body('isDownloadable').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved submissions can be converted to posts' });
    }

    const { categoryId, tags, isDownloadable } = req.body;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Create post from submission
    const post = new Post({
      title: submission.title,
      content: submission.content,
      category: categoryId,
      author: req.user!._id,
      excerpt: submission.content.substring(0, 200) + '...',
      tags: tags || [],
      status: 'draft',
      isDownloadable: isDownloadable || false
    });

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('author', 'email');

    res.json({
      message: 'Submission converted to post successfully',
      post
    });
  } catch (error) {
    console.error('Convert submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;