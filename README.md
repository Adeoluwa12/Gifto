# Personal Writing Website Backend

A Node.js/Express backend with TypeScript for a personal writing website featuring admin dashboard, community management, and EPUB downloads.

## Features

- **User Management**: 
  - Super admin (full control)
  - Admin users (content management)
  - Author registration and login (story submission)
  - Community members (email-based, no login required)
- **Content Management**: 
  - Categories with CRUD operations
  - Posts with rich text, descriptions, and image uploads
  - Font customization (default: Spectral)
  - Draft/Published/Archived status system
- **Permissions System**:
  - Authors: Create, edit, delete their own posts
  - Admins: Manage all content, users, and community
  - Super Admin: Full system control including admin management
- **Community Features**: 
  - Email-based community membership
  - Anonymous commenting system (name required, email optional)
  - Comment approval workflow
- **Story Submissions**: 
  - Public submission form for non-registered users
  - Admin review workflow
  - Convert approved submissions to posts
- **EPUB Downloads**: 
  - Watermarked EPUB generation with Spectral font
  - Download tracking
  - Copyright protection
- **Image Management**: 
  - Image upload for posts
  - Support for both uploaded images and external URLs

## Tech Stack

- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (NoodMailer)
- EPUB generation with watermarks
- Sharp for image processing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/writing-website
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (NoodMailer)
EMAIL_HOST=smtp.noodmailer.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourwebsite.com

# Admin Configuration
SUPER_ADMIN_EMAIL=admin@yourwebsite.com
SUPER_ADMIN_PASSWORD=change-this-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Watermark
WATERMARK_TEXT=© Your Website Name
```

### 3. Database Setup

Make sure MongoDB is running, then initialize the database:

```bash
npm run build
npm run setup
```

This will create:
- Super admin user
- Default categories (Short Stories, Personal Essays, Think Pieces, Articles, Non-Fiction)

### 4. Development

```bash
npm run dev
```

### 5. Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register as author (public)
- `POST /api/auth/login` - Login (all user types)
- `POST /api/auth/create-admin` - Create admin user (super admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Categories
- `GET /api/categories` - Get all categories (public)
- `GET /api/categories/:slug` - Get single category (public)
- `POST /api/categories` - Create category (admin+)
- `PUT /api/categories/:id` - Update category (admin+)
- `DELETE /api/categories/:id` - Delete category (super admin only)

### Posts
- `GET /api/posts` - Get all posts with pagination (public)
- `GET /api/posts/my-posts` - Get current user's posts (authors+)
- `GET /api/posts/:slug` - Get single post with comments (public)
- `GET /api/posts/:slug/download` - Download post as EPUB (public)
- `POST /api/posts` - Create post with image upload (authors+)
- `PUT /api/posts/:id` - Update post (authors: own posts, admins: any)
- `DELETE /api/posts/:id` - Delete post (authors: own posts, admins: any)

### Community
- `POST /api/community/join` - Join community (public)
- `GET /api/community/stats` - Get community stats (admin+)

### Comments
- `POST /api/comments` - Add comment to post (public, anonymous allowed)
- `GET /api/comments/post/:postId` - Get comments for a post (public)
- `GET /api/comments/pending` - Get pending comments (admin+)
- `GET /api/comments` - Get all comments with filters (admin+)
- `PUT /api/comments/:id/approve` - Approve/reject comment (admin+)
- `DELETE /api/comments/:id` - Delete comment (admin+)
- `GET /api/comments/stats` - Get comment statistics (admin+)

### Submissions
- `POST /api/submissions` - Submit story (public)
- `GET /api/submissions` - Get all submissions (admin+)
- `GET /api/submissions/:id` - Get single submission (admin+)
- `PUT /api/submissions/:id/review` - Review submission (admin+)
- `POST /api/submissions/:id/convert-to-post` - Convert to post (admin+)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats (admin+)
- `GET /api/admin/members` - Get community members (admin+)
- `PUT /api/admin/members/:id` - Update member status (admin+)
- `GET /api/admin/authors` - Get all authors with stats (admin+)
- `GET /api/admin/posts` - Get all posts (admin view) (admin+)
- `GET /api/admin/users` - Get admin users (super admin only)
- `PUT /api/admin/users/:id/deactivate` - Deactivate user (super admin only)
- `DELETE /api/admin/users/:id` - Delete user (super admin only)

### Upload
- `POST /api/upload/image` - Upload image (authors+)

## User Roles & Permissions

### Community Members
- Join via email (no login required)
- Comment on posts (name required, email optional)
- Receive email notifications

### Authors
- Register and login to submit stories
- Create, edit, delete their own posts
- Upload images for posts
- View their post statistics

### Admins
- All author permissions
- Manage all posts (any author)
- Manage community members
- Approve/reject comments
- Review and convert submissions
- View admin dashboard and analytics

### Super Admin
- All admin permissions
- Create/delete admin users
- Manage categories (create, edit, delete)
- Full system control

## Post Features

### Content Management
Posts support:
- Title and description
- Rich text content
- Category assignment
- Tags
- Featured images (upload or URL)
- Font customization (default: Spectral)
- Draft/Published/Archived status
- EPUB download capability

### Font Settings
```json
{
  "fontSettings": {
    "fontFamily": "Spectral, serif",
    "fontSize": 16,
    "lineHeight": 1.6
  }
}
```

### EPUB Downloads
- Watermarked EPUB files
- Download tracking
- Only available for posts marked as downloadable

### Comment System
- Public commenting with admin approval
- Nested replies support
- Author name required (no registration needed)

### Community Management
- Email-based community membership
- Welcome emails via NoodMailer
- Admin dashboard for member management

### Submission Workflow
1. Public submission form
2. Admin review (approve/reject)
3. Convert approved submissions to posts
4. Email notifications

## Security Features

- JWT authentication
- Rate limiting
- Helmet security headers
- Input validation
- Password hashing with bcrypt
- Role-based access control

## File Structure

```
src/
├── models/          # Mongoose models
├── routes/          # Express routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── scripts/         # Setup and utility scripts
└── server.ts        # Main server file
```

## Scripts

- `npm run dev` - Development with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run watch` - Watch TypeScript compilation
- `npm run setup` - Initialize database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License