# Nistar API - Frontend Integration Guide

> **Complete API Reference for Frontend Developers**

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Quick Start

### Base URLs
```javascript
const API_BASE_URL = {
  production: 'https://menuchah-api.onrender.com/api',
  development: 'http://localhost:3000/api'
};
```

### Authentication Header
All authenticated requests require a JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### User Roles
- `super_admin` - Full system access
- `admin` - Content moderation, user management
- `author` - Can create and manage own posts
- `user` - Community member (for Phase 2)

---

## 🔐 Authentication

### 1. Register New Author
**Endpoint:** `POST /auth/register`

**Request:**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"  // Min 6 characters
}
```

**Response:**
```javascript
{
  "message": "Author account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ecb74b24a1234567890a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Frontend Tips:**
- Store token in localStorage or secure cookie
- Automatically log user in after registration
- Redirect to dashboard after successful registration

### 2. Login
**Endpoint:** `POST /auth/login`

**Request:**
```javascript
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

**Frontend Tips:**
- Show "Invalid credentials" for 401 errors
- Token expires in 7 days
- Check if user account is active (isActive: true)

---

### 3. Get Current User
**Endpoint:** `GET /auth/me`
**Auth Required:** ✅

**Response:**
```javascript
{
  "user": {
    "id": "60d5ecb74b24a1234567890a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Frontend Tips:**
- Call this on app load to verify token validity
- Use to populate user profile in navbar
- Redirect to login if 401 error

---

### 4. Change Password
**Endpoint:** `PUT /auth/change-password`
**Auth Required:** ✅

**Request:**
```javascript
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```javascript
{
  "message": "Password changed successfully"
}
```

**Frontend Tips:**
- Validate password strength on frontend
- Show success message after change
- Don't log user out after password change

### 5. Create Admin User (Super Admin Only)
**Endpoint:** `POST /auth/create-admin`
**Auth Required:** ✅ (Super Admin)

**Request:**
```javascript
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpass123"
}
```

**Response:**
```javascript
{
  "message": "Admin user created successfully",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Frontend Tips:**
- Only show this option to super_admin users
- Created admin can manage content but not create other admins

---

## 📝 Posts / Content

### 6. Get All Posts (Public)
**Endpoint:** `GET /posts`
**Auth Required:** ❌

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)
- `category` (optional): Category slug (e.g., "short-stories")
- `author` (optional): Author ID
- `search` (optional): Search keyword

**Example:**
```javascript
GET /posts?page=1&limit=10&category=short-stories
```

**Response:**
```javascript
{
  "posts": [
    {
      "_id": "...",
      "title": "The Art of Storytelling",
      "slug": "art-of-storytelling",
      "description": "Exploring narrative techniques",
      "excerpt": "A brief glimpse...",
      "category": {
        "_id": "...",
        "name": "Think Pieces",
        "slug": "think-pieces"
      },
      "author": {
        "_id": "...",
        "name": "Gift Davies",
        "email": "gift@nistar.com"
      },
      "status": "published",
      "publishedAt": "2024-01-01T00:00:00Z",
      "featuredImage": "/uploads/image.jpg",
      "tags": ["writing", "craft"],
      "readTime": 5,
      "downloadCount": 25,
      "isDownloadable": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**Frontend Tips:**
- Use for homepage, category pages, search results
- Implement infinite scroll or pagination
- Cache results for better performance
- Note: `content` field is excluded in list view (performance)
- Filter by category slug, not ID

---

### 7. Get Single Post (Public)
**Endpoint:** `GET /posts/:slug`
**Auth Required:** ❌

**Example:** `GET /posts/art-of-storytelling`

**Response:**
```javascript
{
  "post": {
    "_id": "...",
    "title": "The Art of Storytelling",
    "slug": "art-of-storytelling",
    "description": "Exploring narrative techniques",
    "content": "<p>Full HTML content here...</p>",  // Full content included
    "excerpt": "A brief glimpse...",
    "category": { ... },
    "author": { ... },
    "status": "published",
    "publishedAt": "2024-01-01T00:00:00Z",
    "featuredImage": "/uploads/image.jpg",
    "imageUrl": "https://external-image.com/image.jpg",  // Optional external image
    "tags": ["writing", "craft"],
    "readTime": 8,
    "fontSettings": {
      "fontFamily": "Spectral, serif",
      "fontSize": 18,
      "lineHeight": 1.7
    },
    "downloadCount": 156,
    "isDownloadable": true
  }
}
```

**Frontend Tips:**
- Use slug in URL for SEO (e.g., /posts/art-of-storytelling)
- Render `content` as HTML (sanitize if user-generated)
- Apply `fontSettings` to reading view
- Show download button only if `isDownloadable: true`
- Use `featuredImage` or `imageUrl` for post header

---

### 8. Get My Posts (Author)
**Endpoint:** `GET /posts/my-posts`
**Auth Required:** ✅ (Author+)

**Response:**
```javascript
[
  {
    "_id": "...",
    "title": "My Story",
    "slug": "my-story",
    "status": "published",  // Can be draft, published, or archived
    "category": { ... },
    "publishedAt": "2024-01-01T00:00:00Z",
    "downloadCount": 25,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Frontend Tips:**
- Use for author dashboard
- Show all statuses (draft, published, archived)
- Allow filtering by status
- Provide quick edit/delete actions

---

### 9. Create Post (Author+)
**Endpoint:** `POST /posts`
**Auth Required:** ✅ (Author+)
**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
const formData = new FormData();
formData.append('title', 'My New Post');
formData.append('description', 'Post description');
formData.append('content', '<p>Full HTML content</p>');
formData.append('category', 'category_id_here');
formData.append('excerpt', 'Brief excerpt...');
formData.append('tags', JSON.stringify(['tag1', 'tag2']));
formData.append('status', 'draft');  // draft, published, or archived
formData.append('isDownloadable', 'true');
formData.append('fontSettings', JSON.stringify({
  fontFamily: 'Spectral, serif',
  fontSize: 16,
  lineHeight: 1.6
}));
formData.append('imageUrl', 'https://external-image.com/image.jpg');  // Optional
formData.append('image', fileInput.files[0]);  // Optional file upload
```

**Response:** Full post object

**Frontend Tips:**
- Use rich text editor for content (TinyMCE, Quill, etc.)
- Save as draft by default
- Allow image upload OR external URL
- Validate category exists before submission
- Auto-save drafts periodically
- Calculate readTime on frontend (optional)

---

### 10. Update Post (Author: own posts, Admin: any)
**Endpoint:** `PUT /posts/:id`
**Auth Required:** ✅ (Author+)
**Content-Type:** `multipart/form-data`

**Form Data:** Same as create (all fields optional)

**Response:** Updated post object

**Frontend Tips:**
- Authors can only edit their own posts
- Admins can edit any post
- Check permissions before showing edit button
- Pre-fill form with existing data
- Handle 403 error if user tries to edit others' posts

---

### 11. Delete Post (Author: own posts, Admin: any)
**Endpoint:** `DELETE /posts/:id`
**Auth Required:** ✅ (Author+)

**Response:**
```javascript
{
  "message": "Post deleted successfully"
}
```

**Frontend Tips:**
- Show confirmation dialog before delete
- Authors can only delete their own posts
- Admins can delete any post
- Deleting a post also deletes all its comments
- Remove from UI immediately after successful delete

---

### 12. Download Post as EPUB
**Endpoint:** `GET /posts/:slug/download`
**Auth Required:** ❌

**Example:** `GET /posts/art-of-storytelling/download`

**Response:** Binary EPUB file

**Frontend Tips:**
- Only available if `isDownloadable: true`
- Triggers file download in browser
- Increments download count automatically
- EPUB includes watermark with branding
- Use download attribute on link:
```html
<a href="/api/posts/art-of-storytelling/download" download>
  Download EPUB
</a>
```

---

## 📂 Categories

### 13. Get All Categories (Public)
**Endpoint:** `GET /categories`
**Auth Required:** ❌

**Response:**
```javascript
[
  {
    "_id": "...",
    "name": "Short Stories",
    "slug": "short-stories",
    "description": "Creative fictional narratives",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Frontend Tips:**
- Use for navigation menu
- Filter by `isActive: true` for public display
- Sort by `order` field
- Cache categories (they don't change often)

---

### 14. Get Single Category (Public)
**Endpoint:** `GET /categories/:slug`
**Auth Required:** ❌

**Example:** `GET /categories/short-stories`

**Response:** Single category object

**Frontend Tips:**
- Use for category landing pages
- Show category description
- List posts in this category

---

### 15. Create Category (Admin+)
**Endpoint:** `POST /categories`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "name": "New Category",
  "description": "Category description",
  "order": 5
}
```

**Response:** Created category object

**Frontend Tips:**
- Slug is auto-generated from name
- Order determines display sequence
- Only show to admin+ users

---

### 16. Update Category (Admin+)
**Endpoint:** `PUT /categories/:id`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "name": "Updated Name",
  "description": "Updated description",
  "order": 3,
  "isActive": true
}
```

**Response:** Updated category object

**Frontend Tips:**
- All fields optional
- Use `isActive: false` to hide category without deleting

---

### 17. Delete Category (Super Admin Only)
**Endpoint:** `DELETE /categories/:id`
**Auth Required:** ✅ (Super Admin)

**Response:**
```javascript
{
  "message": "Category deleted successfully"
}
```

**Frontend Tips:**
- Only super_admin can delete
- Show warning if category has posts
- Consider deactivating instead of deleting

---

## 💬 Comments

### 18. Get Comments for Post (Public)
**Endpoint:** `GET /comments/post/:postId`
**Auth Required:** ❌

**Example:** `GET /comments/post/60d5ecb74b24a1234567890a`

**Response:**
```javascript
[
  {
    "_id": "...",
    "authorName": "John Doe",
    "authorEmail": "john@example.com",
    "content": "Great post!",
    "isApproved": true,
    "parentComment": null,
    "replies": [
      {
        "_id": "...",
        "authorName": "Reply Author",
        "content": "I agree!",
        "isApproved": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Frontend Tips:**
- Only approved comments are returned
- Nested replies included in `replies` array
- Build threaded comment UI
- Sort by createdAt (oldest first)

---

### 19. Add Comment (Public)
**Endpoint:** `POST /comments`
**Auth Required:** ❌

**Request:**
```javascript
{
  "post": "post_id_here",
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "content": "This is a great post!",
  "parentComment": "parent_comment_id"  // Optional, for replies
}
```

**Response:**
```javascript
{
  "message": "Comment submitted for review",
  "comment": {
    "id": "...",
    "authorName": "John Doe",
    "content": "This is a great post!",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Tips:**
- Comments require moderation (not shown immediately)
- Show "pending approval" message after submission
- Validate email format
- Use `parentComment` for threaded replies
- Don't require authentication (public commenting)

---

### 20. Get Pending Comments (Admin+)
**Endpoint:** `GET /comments/pending`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Comments per page (default: 20, max: 100)

**Response:**
```javascript
{
  "comments": [
    {
      "_id": "...",
      "post": {
        "_id": "...",
        "title": "Post Title",
        "slug": "post-slug"
      },
      "authorName": "Commenter",
      "authorEmail": "commenter@email.com",
      "content": "Comment content",
      "isApproved": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Frontend Tips:**
- Use for admin moderation dashboard
- Show post title for context
- Provide quick approve/reject actions
- Badge count for pending comments

---

### 21. Get All Comments (Admin+)
**Endpoint:** `GET /comments`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by "approved" or "pending"
- `post`: Filter by post ID

**Response:** Similar to pending comments

**Frontend Tips:**
- Use for full comment management
- Filter by status and post
- Bulk actions for moderation

---

### 22. Approve/Reject Comment (Admin+)
**Endpoint:** `PUT /comments/:id/approve`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "isApproved": true  // or false to reject
}
```

**Response:**
```javascript
{
  "message": "Comment approved",
  "comment": { ... }
}
```

**Frontend Tips:**
- Update UI immediately after approval
- Remove from pending list
- Show success notification

---

### 23. Delete Comment (Admin+)
**Endpoint:** `DELETE /comments/:id`
**Auth Required:** ✅ (Admin+)

**Response:**
```javascript
{
  "message": "Comment deleted successfully"
}
```

**Frontend Tips:**
- Show confirmation dialog
- Remove from UI after delete
- Consider soft delete (hide) instead

---

### 24. Get Comment Statistics (Admin+)
**Endpoint:** `GET /comments/stats`
**Auth Required:** ✅ (Admin+)

**Response:**
```javascript
{
  "totalComments": 1250,
  "approvedComments": 1100,
  "pendingComments": 150,
  "commentsThisMonth": 85
}
```

**Frontend Tips:**
- Use for admin dashboard
- Show as cards or metrics
- Update in real-time if possible

---

## 📄 Story Submissions

### 25. Submit Story (Public)
**Endpoint:** `POST /submissions`
**Auth Required:** ❌

**Request:**
```javascript
{
  "title": "My Amazing Story",
  "content": "Once upon a time...",
  "authorName": "Aspiring Writer",
  "authorEmail": "writer@email.com",
  "category": "short-stories"  // Category slug
}
```

**Response:**
```javascript
{
  "message": "Submission received successfully! We will review it and get back to you.",
  "submission": {
    "id": "...",
    "title": "My Amazing Story",
    "authorName": "Aspiring Writer",
    "category": "short-stories",
    "submittedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Tips:**
- Public submission form
- Show success message with timeline
- Validate all fields
- Use category slug, not ID
- Consider character limit for content

---

### 26. Get All Submissions (Admin+)
**Endpoint:** `GET /submissions`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by "pending", "approved", "rejected"
- `category`: Filter by category

**Response:**
```javascript
{
  "submissions": [
    {
      "_id": "...",
      "title": "Story Title",
      "authorName": "Author Name",
      "authorEmail": "author@email.com",
      "category": "short-stories",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "notes": null
    }
  ],
  "pagination": { ... }
}
```

**Frontend Tips:**
- Use for admin review dashboard
- Filter by status (pending, approved, rejected)
- Show submission count badges
- Sort by submission date

---

### 27. Get Single Submission (Admin+)
**Endpoint:** `GET /submissions/:id`
**Auth Required:** ✅ (Admin+)

**Response:**
```javascript
{
  "_id": "...",
  "title": "Story Title",
  "content": "Full story content...",  // Full content included
  "authorName": "Author Name",
  "authorEmail": "author@email.com",
  "category": "short-stories",
  "status": "pending",
  "submittedAt": "2024-01-01T00:00:00Z",
  "reviewedBy": null,
  "reviewedAt": null,
  "notes": null
}
```

**Frontend Tips:**
- Use for detailed review page
- Show full content for review
- Provide approve/reject actions
- Add notes field for feedback

---

### 28. Review Submission (Admin+)
**Endpoint:** `PUT /submissions/:id/review`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "status": "approved",  // or "rejected"
  "notes": "Great story! Minor edits needed."  // Optional
}
```

**Response:**
```javascript
{
  "message": "Submission approved",
  "submission": { ... }
}
```

**Frontend Tips:**
- Update status immediately
- Send email notification to author (backend handles this)
- Show notes field for feedback
- Move to appropriate list after review

---

### 29. Convert Submission to Post (Admin+)
**Endpoint:** `POST /submissions/:id/convert-to-post`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "categoryId": "category_id_here",  // Use category ID, not slug
  "tags": ["fiction", "drama", "contemporary"],
  "isDownloadable": true
}
```

**Response:**
```javascript
{
  "message": "Submission converted to post successfully",
  "post": {
    "_id": "...",
    "title": "Story Title",
    "slug": "story-title",
    "content": "Story content...",
    "category": { ... },
    "author": { ... },  // Admin who converted it
    "status": "draft",  // Created as draft
    "tags": ["fiction", "drama", "contemporary"],
    "isDownloadable": true
  }
}
```

**Frontend Tips:**
- Only for approved submissions
- Creates post as draft (not published)
- Admin becomes the author
- Redirect to post edit page after conversion
- Original submission remains in database

---

## 👥 Community / Mailing List

### 30. Join Community
**Endpoint:** `POST /community/join`
**Auth Required:** ❌

**Request:**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```javascript
{
  "message": "Successfully joined the community!",
  "member": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Tips:**
- Newsletter signup form
- Footer or sidebar widget
- Show success message
- Prevent duplicate signups (backend handles this)
- Consider double opt-in for email verification

---

### 31. Get Community Stats (Admin+)
**Endpoint:** `GET /community/stats`
**Auth Required:** ✅ (Admin+)

**Response:**
```javascript
{
  "totalMembers": 1250,
  "newMembersThisMonth": 45,
  "pendingComments": 12,
  "totalComments": 456
}
```

**Frontend Tips:**
- Use for admin dashboard
- Show as metric cards
- Track growth over time

---

## 🎛️ Admin Endpoints

### 32. Get Admin Dashboard (Admin+)
**Endpoint:** `GET /admin/dashboard`
**Auth Required:** ✅ (Admin+)

**Response:**
```javascript
{
  "stats": {
    "totalPosts": 45,
    "publishedPosts": 38,
    "draftPosts": 7,
    "totalMembers": 1250,
    "pendingComments": 12,
    "pendingSubmissions": 8
  },
  "recentActivity": {
    "recentPosts": [ /* Array of recent posts */ ],
    "recentMembers": [ /* Array of recent members */ ]
  }
}
```

**Frontend Tips:**
- Main admin dashboard page
- Show stats as cards/widgets
- Display recent activity feed
- Add quick action buttons
- Refresh stats periodically

---

### 33. Get Community Members (Admin+)
**Endpoint:** `GET /admin/members`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search by name or email

**Response:**
```javascript
{
  "members": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "joinedAt": "2024-01-01T00:00:00Z",
      "isActive": true,
      "emailVerified": true
    }
  ],
  "pagination": { ... }
}
```

**Frontend Tips:**
- Member management page
- Search functionality
- Export to CSV option
- Bulk actions for email campaigns

---

### 34. Update Member Status (Admin+)
**Endpoint:** `PUT /admin/members/:id`
**Auth Required:** ✅ (Admin+)

**Request:**
```javascript
{
  "isActive": false  // Deactivate member
}
```

**Response:**
```javascript
{
  "message": "Member status updated",
  "member": { ... }
}
```

**Frontend Tips:**
- Toggle active/inactive status
- Show confirmation for deactivation
- Update UI immediately

---

### 35. Get Admin Users (Super Admin Only)
**Endpoint:** `GET /admin/users`
**Auth Required:** ✅ (Super Admin)

**Response:**
```javascript
[
  {
    "_id": "...",
    "name": "Gift Davies",
    "email": "gift@nistar.com",
    "role": "super_admin",
    "isActive": true,
    "createdBy": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@nistar.com",
    "role": "admin",
    "isActive": true,
    "createdBy": {
      "_id": "...",
      "name": "Gift Davies",
      "email": "gift@nistar.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Frontend Tips:**
- Only visible to super_admin
- Show who created each admin
- Provide deactivate/delete actions
- Can't delete super_admin

---

### 36. Get All Authors (Admin+)
**Endpoint:** `GET /admin/authors`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search by name or email

**Response:**
```javascript
{
  "authors": [
    {
      "_id": "...",
      "name": "Gift Davies",
      "email": "gift@nistar.com",
      "role": "super_admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "totalPosts": 25,
        "publishedPosts": 20
      }
    }
  ],
  "pagination": { ... }
}
```

**Frontend Tips:**
- Author management page
- Show post statistics
- Search and filter
- Link to author's posts

---

### 37. Get All Posts (Admin View)
**Endpoint:** `GET /admin/posts`
**Auth Required:** ✅ (Admin+)

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by "draft", "published", "archived"
- `author`: Filter by author ID

**Response:**
```javascript
{
  "posts": [ /* Array of posts with all statuses */ ],
  "pagination": { ... }
}
```

**Frontend Tips:**
- Admin post management
- See all posts (including drafts)
- Filter by status and author
- Bulk actions (publish, archive, delete)

---

### 38. Deactivate User (Super Admin Only)
**Endpoint:** `PUT /admin/users/:id/deactivate`
**Auth Required:** ✅ (Super Admin)

**Response:**
```javascript
{
  "message": "User deactivated successfully"
}
```

**Frontend Tips:**
- Only super_admin can deactivate
- Can't deactivate super_admin
- Show confirmation dialog
- User can't login when deactivated

---

### 39. Delete User (Super Admin Only)
**Endpoint:** `DELETE /admin/users/:id`
**Auth Required:** ✅ (Super Admin)

**Response:**
```javascript
{
  "message": "User deleted successfully"
}
```

**Frontend Tips:**
- Only super_admin can delete
- Can't delete super_admin
- Show strong warning (permanent action)
- Consider deactivate instead of delete

---

## 👤 User Profile

### 40. Get User Profile (Public)
**Endpoint:** `GET /profile/:id`
**Auth Required:** ❌

**Response:**
```javascript
{
  "user": {
    "_id": "...",
    "name": "Gift Davies",
    "email": "gift@nistar.com",
    "bio": "Award-winning author and storyteller...",
    "profileImage": "/uploads/gift-profile.jpg",
    "socialLinks": {
      "twitter": "https://twitter.com/giftdavies",
      "instagram": "https://instagram.com/giftdavies",
      "linkedin": "https://linkedin.com/in/giftdavies",
      "website": "https://giftdavies.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "posts": [ /* Array of user's published posts */ ],
  "stats": {
    "totalPosts": 25,
    "totalDownloads": 1250
  }
}
```

**Frontend Tips:**
- Public author profile page
- Show bio and social links
- List author's posts
- Display statistics
- Use for /author/:id routes

---

### 41. Get Own Profile (Authenticated)
**Endpoint:** `GET /profile/me/profile`
**Auth Required:** ✅

**Response:**
```javascript
{
  "user": {
    /* Same as public profile, plus: */
    "role": "super_admin",
    "email": "gift@nistar.com"  // Full email visible
  }
}
```

**Frontend Tips:**
- Use for profile settings page
- Shows private information
- Pre-fill edit forms

---

### 42. Update Own Profile (Authenticated)
**Endpoint:** `PUT /profile/me`
**Auth Required:** ✅
**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
const formData = new FormData();
formData.append('name', 'Updated Name');
formData.append('bio', 'Updated bio text...');
formData.append('socialLinks', JSON.stringify({
  twitter: 'https://twitter.com/newhandle',
  instagram: 'https://instagram.com/newhandle',
  linkedin: 'https://linkedin.com/in/newhandle',
  website: 'https://newwebsite.com'
}));
formData.append('profileImage', fileInput.files[0]);  // Optional
```

**Response:**
```javascript
{
  "message": "Profile updated successfully",
  "user": { /* Updated user object */ }
}
```

**Frontend Tips:**
- Profile settings page
- All fields optional
- Image upload for profile picture
- Validate social media URLs
- Show preview before save

---

## 📤 File Upload

### 43. Upload Image (Author+)
**Endpoint:** `POST /upload/image`
**Auth Required:** ✅ (Author+)
**Content-Type:** `multipart/form-data`

**Form Data:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
```

**Response:**
```javascript
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/image-1234567890.jpg",
  "filename": "image-1234567890.jpg",
  "originalName": "my-image.jpg",
  "size": 1024000
}
```

**Frontend Tips:**
- Use for standalone image uploads
- Integrate with rich text editor
- Show upload progress
- Validate file type (jpg, png, gif)
- Max file size: 10MB (configurable)
- Use returned `imageUrl` in posts

---

## 🔧 Common Patterns

### Authentication Flow
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await loginResponse.json();

// 2. Store token
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// 3. Use token in requests
const response = await fetch('/api/posts/my-posts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 4. Handle 401 (token expired)
if (response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

---

### Pagination Pattern
```javascript
const [page, setPage] = useState(1);
const [posts, setPosts] = useState([]);
const [pagination, setPagination] = useState({});

const fetchPosts = async (pageNum) => {
  const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
  const data = await response.json();
  setPosts(data.posts);
  setPagination(data.pagination);
};

// Render pagination
<div>
  <button 
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>
  <span>Page {pagination.page} of {pagination.pages}</span>
  <button 
    disabled={page === pagination.pages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>
</div>
```

---

### File Upload Pattern
```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData  // Don't set Content-Type, browser will set it
  });

  const data = await response.json();
  return data.imageUrl;  // Use this URL in your post
};
```

---

### Role-Based UI
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Check if user is admin or above
const isAdmin = ['admin', 'super_admin'].includes(user?.role);

// Check if user is super admin
const isSuperAdmin = user?.role === 'super_admin';

// Conditional rendering
{isAdmin && (
  <Link to="/admin/dashboard">Admin Dashboard</Link>
)}

{isSuperAdmin && (
  <button onClick={handleDeleteUser}>Delete User</button>
)}
```

---

## ⚠️ Error Handling

### Standard Error Responses

**400 - Validation Error:**
```javascript
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**401 - Unauthorized:**
```javascript
{
  "message": "Access denied. No token provided."
}
// or
{
  "message": "Invalid credentials"
}
```

**403 - Forbidden:**
```javascript
{
  "message": "Access denied. Insufficient permissions."
}
```

**404 - Not Found:**
```javascript
{
  "message": "Post not found"
}
```

**500 - Server Error:**
```javascript
{
  "message": "Something went wrong!"
}
```

---

### Error Handling Pattern
```javascript
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      } else if (response.status === 400) {
        // Show validation errors
        setErrors(data.errors);
      } else if (response.status === 403) {
        // Show permission error
        alert('You do not have permission to perform this action');
      } else {
        // Generic error
        alert(data.message || 'Something went wrong');
      }
      return;
    }

    // Success
    console.log('Success:', data);
  } catch (error) {
    // Network error
    console.error('Network error:', error);
    alert('Unable to connect to server');
  }
};
```

---

## 💡 Tips & Best Practices

### 1. Token Management
- Store JWT in localStorage or httpOnly cookie
- Token expires in 7 days
- Check token validity on app load
- Clear token on logout or 401 error
- Don't send token for public endpoints

### 2. Image Handling
- Featured images can be uploaded files OR external URLs
- Use `/uploads/` prefix for uploaded images
- Full URL for external images
- Validate image size (max 10MB)
- Support jpg, png, gif formats

### 3. Content Rendering
- Posts contain HTML content - sanitize before rendering
- Use DOMPurify or similar for XSS protection
- Apply fontSettings to reading view
- Respect line height and font family settings

### 4. Pagination
- Default: 10 items per page
- Max: 50 items per page (posts), 100 (comments)
- Always show total count
- Implement infinite scroll or traditional pagination

### 5. Search & Filtering
- Debounce search input (300-500ms)
- Use query parameters for filters
- Maintain filter state in URL
- Clear filters option

### 6. Real-time Updates
- Poll for pending comments/submissions count
- Refresh dashboard stats periodically
- Show "new content available" notification
- Consider WebSocket for real-time features (Phase 2)

### 7. Performance
- Cache categories (rarely change)
- Lazy load images
- Implement virtual scrolling for long lists
- Prefetch next page of results
- Use skeleton loaders

### 8. User Experience
- Show loading states
- Provide clear error messages
- Confirm destructive actions (delete)
- Auto-save drafts
- Show character/word count
- Preview before publish

### 9. SEO Optimization
- Use post slugs in URLs
- Server-side rendering for public pages
- Meta tags from post data
- Sitemap generation
- Canonical URLs

### 10. Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

---

## 📊 Quick Reference Table

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/auth/register` | POST | ❌ | Public | Register new author |
| `/auth/login` | POST | ❌ | Public | User login |
| `/auth/me` | GET | ✅ | Any | Get current user |
| `/auth/change-password` | PUT | ✅ | Any | Change password |
| `/auth/create-admin` | POST | ✅ | Super Admin | Create admin user |
| `/posts` | GET | ❌ | Public | List published posts |
| `/posts/:slug` | GET | ❌ | Public | Get single post |
| `/posts/my-posts` | GET | ✅ | Author+ | Get own posts |
| `/posts` | POST | ✅ | Author+ | Create post |
| `/posts/:id` | PUT | ✅ | Author+ | Update post |
| `/posts/:id` | DELETE | ✅ | Author+ | Delete post |
| `/posts/:slug/download` | GET | ❌ | Public | Download EPUB |
| `/categories` | GET | ❌ | Public | List categories |
| `/categories/:slug` | GET | ❌ | Public | Get category |
| `/categories` | POST | ✅ | Admin+ | Create category |
| `/categories/:id` | PUT | ✅ | Admin+ | Update category |
| `/categories/:id` | DELETE | ✅ | Super Admin | Delete category |
| `/comments/post/:id` | GET | ❌ | Public | Get post comments |
| `/comments` | POST | ❌ | Public | Add comment |
| `/comments/pending` | GET | ✅ | Admin+ | Get pending comments |
| `/comments` | GET | ✅ | Admin+ | Get all comments |
| `/comments/:id/approve` | PUT | ✅ | Admin+ | Approve/reject comment |
| `/comments/:id` | DELETE | ✅ | Admin+ | Delete comment |
| `/comments/stats` | GET | ✅ | Admin+ | Comment statistics |
| `/submissions` | POST | ❌ | Public | Submit story |
| `/submissions` | GET | ✅ | Admin+ | List submissions |
| `/submissions/:id` | GET | ✅ | Admin+ | Get submission |
| `/submissions/:id/review` | PUT | ✅ | Admin+ | Review submission |
| `/submissions/:id/convert-to-post` | POST | ✅ | Admin+ | Convert to post |
| `/community/join` | POST | ❌ | Public | Join community |
| `/community/stats` | GET | ✅ | Admin+ | Community stats |
| `/admin/dashboard` | GET | ✅ | Admin+ | Dashboard stats |
| `/admin/members` | GET | ✅ | Admin+ | List members |
| `/admin/members/:id` | PUT | ✅ | Admin+ | Update member |
| `/admin/users` | GET | ✅ | Super Admin | List admin users |
| `/admin/authors` | GET | ✅ | Admin+ | List authors |
| `/admin/posts` | GET | ✅ | Admin+ | List all posts |
| `/admin/users/:id/deactivate` | PUT | ✅ | Super Admin | Deactivate user |
| `/admin/users/:id` | DELETE | ✅ | Super Admin | Delete user |
| `/profile/:id` | GET | ❌ | Public | Get user profile |
| `/profile/me/profile` | GET | ✅ | Any | Get own profile |
| `/profile/me` | PUT | ✅ | Any | Update own profile |
| `/upload/image` | POST | ✅ | Author+ | Upload image |

---

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 📞 Support

For questions or issues:
- Check API documentation: `API_DOCUMENTATION.md`
- Review OpenAPI spec: `openapi.yaml`
- Check Phase 1 status: `PHASE1_STATUS.md`

---

## 🔄 Version

**API Version:** 1.0.0  
**Last Updated:** February 2026  
**Phase:** 1 (Publishing System)

---

**Happy Coding! 🚀**
