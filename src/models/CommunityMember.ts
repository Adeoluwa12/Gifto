import mongoose, { Schema } from 'mongoose';
import { ICommunityMember } from '../types';

const communityMemberSchema = new Schema<ICommunityMember>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<ICommunityMember>('CommunityMember', communityMemberSchema);