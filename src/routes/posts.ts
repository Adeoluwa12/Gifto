import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Post from '../models/Post';
import Category from '../models/Category';
import Comment from '../models/Comment';
import { authenticate, adminOrSuperAdmin, authorOrAbove } from '../middleware/auth';
import { AuthRequest } from '../types';
import epubGenerator from '../utils/epub';
import upload from '../middleware/upload';
import path from 'path';

const router = express.Router();

// Get all posts (public with pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isString(),
  query('status').optional().isIn(['published', 'draft', 'archived']),
  query('author').optional().isString()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'published' };
    
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        filter.category = category._id;
      }
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    const posts = await Post.find(filter)
      .populate('category', 'name slug')
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for list view

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
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by current user (authors can see their own posts)
router.get('/my-posts', authenticate, authorOrAbove, async (req: AuthRequest, res) => {
  try {
    const posts = await Post.find({ author: req.user!._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
      .populate('category', 'name slug')
      .populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post (authors and above)
router.post('/', authenticate, authorOrAbove, upload.single('image'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('excerpt').optional().trim(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('isDownloadable').optional().isBoolean(),
  body('fontSettings').optional().isObject(),
  body('imageUrl').optional().isURL()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, content, category, excerpt, tags, status, isDownloadable, fontSettings, imageUrl } = req.body;

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Handle image upload
    let featuredImage = imageUrl || '';
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = new Post({
      title,
      description,
      content,
      category,
      author: req.user!._id,
      excerpt,
      tags: tags || [],
      status: status || 'draft',
      isDownloadable: isDownloadable || false,
      fontSettings: fontSettings || {},
      featuredImage,
      imageUrl
    });

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('author', 'name email');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post (authors can edit their own, admins can edit any)
router.put('/:id', authenticate, authorOrAbove, upload.single('image'), [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('content').optional().trim().isLength({ min: 1 }),
  body('category').optional().isMongoId(),
  body('excerpt').optional().trim(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('isDownloadable').optional().isBoolean(),
  body('fontSettings').optional().isObject(),
  body('imageUrl').optional().isURL()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check permissions: authors can only edit their own posts
    if (req.user!.role === 'author' && post.author.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const updateFields = ['title', 'description', 'content', 'category', 'excerpt', 'tags', 'status', 'isDownloadable', 'fontSettings', 'imageUrl'];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (post as any)[field] = req.body[field];
      }
    });

    // Handle image upload
    if (req.file) {
      post.featuredImage = `/uploads/${req.file.filename}`;
    }

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('author', 'name email');

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download post as EPUB
router.get('/:slug/download', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug, 
      status: 'published',
      isDownloadable: true 
    })
      .populate('category', 'name')
      .populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or not downloadable' });
    }

    // Increment download count
    post.downloadCount += 1;
    await post.save();

    // Generate EPUB
    const epubBuffer = await epubGenerator.generateEpub({
      title: post.title,
      author: (post.author as any).name,
      content: post.content,
      watermarkText: process.env.WATERMARK_TEXT || '© Personal Writing Website'
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('Content-Disposition', `attachment; filename="${post.slug}.epub"`);
    res.setHeader('Content-Length', epubBuffer.length);

    res.send(epubBuffer);
  } catch (error) {
    console.error('Download EPUB error:', error);
    res.status(500).json({ message: 'Failed to generate EPUB' });
  }
});

// Delete post (authors can delete their own, admins can delete any)
router.delete('/:id', authenticate, authorOrAbove, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check permissions: authors can only delete their own posts
    if (req.user!.role === 'author' && post.author.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;