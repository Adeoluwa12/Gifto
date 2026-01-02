import express from 'express';
import { body, validationResult } from 'express-validator';
import CommunityMember from '../models/CommunityMember';
import Comment from '../models/Comment';
import { authenticate, adminOrSuperAdmin } from '../middleware/auth';
import emailService from '../utils/email';

const router = express.Router();

// Join community (public)
router.post('/join', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check if already a member
    const existingMember = await CommunityMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const member = new CommunityMember({
      name,
      email
    });

    await member.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(name, email);
      member.emailVerified = true;
      await member.save();
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Successfully joined the community!',
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        joinedAt: member.joinedAt
      }
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community stats (admin only)
router.get('/stats', authenticate, adminOrSuperAdmin, async (req, res) => {
  try {
    const totalMembers = await CommunityMember.countDocuments({ isActive: true });
    const newMembersThisMonth = await CommunityMember.countDocuments({
      isActive: true,
      joinedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    const totalComments = await Comment.countDocuments({ isApproved: true });

    res.json({
      totalMembers,
      newMembersThisMonth,
      pendingComments,
      totalComments
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;