import { Document } from 'mongoose';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin' | 'author';
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  description?: string;
  content: string;
  excerpt?: string;
  category: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  featuredImage?: string;
  imageUrl?: string;
  tags: string[];
  readTime?: number;
  fontSettings?: {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
  };
  downloadCount: number;
  isDownloadable: boolean;
}

export interface ICommunityMember extends Document {
  name: string;
  email: string;
  joinedAt: Date;
  isActive: boolean;
  emailVerified: boolean;
}

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail?: string;
  userId?: mongoose.Types.ObjectId; // Optional - for registered users
  content: string;
  isApproved: boolean;
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
}

export interface ISubmission extends Document {
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Route handler types
export type RouteHandler = (req: Request, res: Response) => Promise<void> | void;
export type AuthRouteHandler = (req: AuthRequest, res: Response) => Promise<void> | void;