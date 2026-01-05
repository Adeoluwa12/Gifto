# Nistar API - Complete Documentation

## Project Overview
Nistar is a premium personal writing website for Gift Davies, featuring literary works, community engagement, admin management, and story submissions. Built with Node.js, Express, TypeScript, and MongoDB.

## Base URL
```
Production: https://menuchah-api.onrender.com/api
Development: http://localhost:3000/api
```

## Authentication
Include JWT token in authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Complete API Endpoints

### 🔐 Authentication (`/api/auth`)

#### 1. Register Author
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "Author Name",
  "email": "author@email.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Author account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Author Name",
    "email": "author@email.com",
    "role": "author"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

#### 2. Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com",
    "role": "author"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com",
    "role": "author"
  }
}
```

**cURL Example:**
```bash
curl -X GET https://menuchah-api.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 4. Create Admin User (Super Admin Only)
```http
POST /api/auth/create-admin
Authorization: Bearer {super_admin_token}
```

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@email.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "user_id",
    "name": "Admin Name",
    "email": "admin@email.com",
    "role": "admin"
  }
}
```

---

#### 5. Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

### 📝 Categories (`/api/categories`)

#### 1. Get All Categories (Public)
```http
GET /api/categories
```

**Response (200):**
```json
[
  {
    "_id": "category_id",
    "name": "Short Stories",
    "slug": "short-stories",
    "description": "Creative fictional narratives",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "_id": "category_id_2",
    "name": "Personal Essays",
    "slug": "personal-essays",
    "description": "Personal reflections and experiences",
    "isActive": true,
    "order": 2,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET https://menuchah-api.onrender.com/api/categories
```

---

#### 2. Get Single Category (Public)
```http
GET /api/categories/{slug}
```

**Response (200):**
```json
{
  "_id": "category_id",
  "name": "Short Stories",
  "slug": "short-stories",
  "description": "Creative fictional narratives",
  "isActive": true,
  "order": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

#### 3. Create Category (Admin+)
```http
POST /api/categories
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "order": 5
}
```

**Response (201):**
```json
{
  "_id": "new_category_id",
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "isActive": true,
  "order": 5,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

#### 4. Update Category (Admin+)
```http
PUT /api/categories/{id}
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "order": 3,
  "isActive": true
}
```

---

#### 5. Delete Category (Super Admin Only)
```http
DELETE /api/categories/{id}
Authorization: Bearer {super_admin_token}
```

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

---

### 📖 Posts (`/api/posts`)

#### 1. Get All Posts (Public)
```http
GET /api/posts?page=1&limit=10&category=short-stories&search=keyword&author=author_id
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)
- `category` (optional): Category slug
- `search` (optional): Search keyword
- `author` (optional): Author ID
- `status` (optional): Post status (for admin views)

**Response (200):**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "The Art of Storytelling",
      "slug": "art-of-storytelling",
      "description": "Exploring narrative techniques",
      "excerpt": "A brief glimpse into storytelling...",
      "category": {
        "_id": "category_id",
        "name": "Think Pieces",
        "slug": "think-pieces"
      },
      "author": {
        "_id": "author_id",
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
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
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

**cURL Example:**
```bash
curl -X GET "https://menuchah-api.onrender.com/api/posts?page=1&limit=5&category=short-stories"
```

---

#### 2. Get Single Post (Public)
```http
GET /api/posts/{slug}
```

**Response (200):**
```json
{
  "post": {
    "_id": "post_id",
    "title": "The Art of Storytelling",
    "slug": "art-of-storytelling",
    "description": "Exploring narrative techniques",
    "content": "Full post content with HTML formatting...",
    "excerpt": "A brief glimpse into storytelling...",
    "category": {
      "_id": "category_id",
      "name": "Think Pieces",
      "slug": "think-pieces"
    },
    "author": {
      "_id": "author_id",
      "name": "Gift Davies",
      "email": "gift@nistar.com"
    },
    "status": "published",
    "publishedAt": "2024-01-01T00:00:00Z",
    "featuredImage": "/uploads/image.jpg",
    "imageUrl": "https://external-image.com/image.jpg",
    "tags": ["writing", "craft", "storytelling"],
    "readTime": 8,
    "fontSettings": {
      "fontFamily": "Spectral, serif",
      "fontSize": 18,
      "lineHeight": 1.7
    },
    "downloadCount": 156,
    "isDownloadable": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 3. Get Author's Posts
```http
GET /api/posts/my-posts
Authorization: Bearer {author_token}
```

**Response (200):**
```json
[
  {
    "_id": "post_id",
    "title": "My Story",
    "slug": "my-story",
    "status": "published",
    "category": {
      "name": "Short Stories",
      "slug": "short-stories"
    },
    "publishedAt": "2024-01-01T00:00:00Z",
    "downloadCount": 25,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 4. Create Post (Authors+)
```http
POST /api/posts
Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Post Title"
description: "Post description"
content: "Full post content with HTML"
category: "category_id"
excerpt: "Post excerpt"
tags: ["tag1", "tag2"]
status: "draft" | "published" | "archived"
isDownloadable: true | false
fontSettings: {"fontFamily": "Spectral, serif", "fontSize": 16, "lineHeight": 1.6}
imageUrl: "https://external-image.com/image.jpg"
image: [file] (optional)
```

**Response (201):**
```json
{
  "_id": "new_post_id",
  "title": "Post Title",
  "slug": "post-title",
  "description": "Post description",
  "content": "Full post content",
  "category": {
    "_id": "category_id",
    "name": "Category Name",
    "slug": "category-slug"
  },
  "author": {
    "_id": "author_id",
    "name": "Author Name",
    "email": "author@email.com"
  },
  "status": "draft",
  "featuredImage": "/uploads/filename.jpg",
  "tags": ["tag1", "tag2"],
  "readTime": 5,
  "fontSettings": {
    "fontFamily": "Spectral, serif",
    "fontSize": 16,
    "lineHeight": 1.6
  },
  "isDownloadable": false,
  "downloadCount": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test Post" \
  -F "content=This is test content" \
  -F "category=category_id" \
  -F "status=draft" \
  -F "image=@/path/to/image.jpg"
```

---

#### 5. Update Post (Authors: own posts, Admins: any)
```http
PUT /api/posts/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:** (same as create, all fields optional)

---

#### 6. Download Post as EPUB (Public)
```http
GET /api/posts/{slug}/download
```

**Response:** EPUB file download

**cURL Example:**
```bash
curl -X GET https://menuchah-api.onrender.com/api/posts/post-slug/download \
  -o "post-title.epub"
```

---

#### 7. Delete Post (Authors: own posts, Admins: any)
```http
DELETE /api/posts/{id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

---

### 👥 Community (`/api/community`)

#### 1. Join Community (Public)
```http
POST /api/community/join
```

**Request Body:**
```json
{
  "name": "Member Name",
  "email": "member@email.com"
}
```

**Response (201):**
```json
{
  "message": "Successfully joined the community!",
  "member": {
    "id": "member_id",
    "name": "Member Name",
    "email": "member@email.com",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/community/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

---

#### 2. Get Community Stats (Admin+)
```http
GET /api/community/stats
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "totalMembers": 1250,
  "newMembersThisMonth": 45,
  "pendingComments": 12,
  "totalComments": 456
}
```

---

### 💬 Comments (`/api/comments`)

#### 1. Add Comment (Public)
```http
POST /api/comments
```

**Request Body:**
```json
{
  "post": "post_id",
  "authorName": "Commenter Name",
  "authorEmail": "commenter@email.com",
  "content": "This is a great post! I really enjoyed reading it.",
  "parentComment": "parent_comment_id"
}
```

**Response (201):**
```json
{
  "message": "Comment submitted for review",
  "comment": {
    "id": "comment_id",
    "authorName": "Commenter Name",
    "content": "This is a great post! I really enjoyed reading it.",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "post": "post_id_here",
    "authorName": "John Doe",
    "authorEmail": "john@example.com",
    "content": "Great article!"
  }'
```

---

#### 2. Get Comments for Post (Public)
```http
GET /api/comments/post/{postId}
```

**Response (200):**
```json
[
  {
    "_id": "comment_id",
    "authorName": "Commenter Name",
    "authorEmail": "commenter@email.com",
    "content": "This is a great post!",
    "isApproved": true,
    "parentComment": null,
    "replies": [
      {
        "_id": "reply_id",
        "authorName": "Reply Author",
        "content": "I agree completely!",
        "isApproved": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 3. Get Pending Comments (Admin+)
```http
GET /api/comments/pending?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "comments": [
    {
      "_id": "comment_id",
      "post": {
        "_id": "post_id",
        "title": "Post Title",
        "slug": "post-slug"
      },
      "authorName": "Commenter Name",
      "authorEmail": "commenter@email.com",
      "content": "Comment content",
      "isApproved": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### 4. Get All Comments (Admin+)
```http
GET /api/comments?page=1&limit=20&status=approved&post=post_id
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Comments per page
- `status` (optional): `approved` or `pending`
- `post` (optional): Filter by post ID

---

#### 5. Approve/Reject Comment (Admin+)
```http
PUT /api/comments/{id}/approve
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "isApproved": true
}
```

**Response (200):**
```json
{
  "message": "Comment approved",
  "comment": {
    "_id": "comment_id",
    "authorName": "Commenter Name",
    "content": "Comment content",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6. Delete Comment (Admin+)
```http
DELETE /api/comments/{id}
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

#### 7. Get Comment Statistics (Admin+)
```http
GET /api/comments/stats
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "totalComments": 1250,
  "approvedComments": 1100,
  "pendingComments": 150,
  "commentsThisMonth": 85
}
```

---

### 📄 Submissions (`/api/submissions`)

#### 1. Submit Story (Public)
```http
POST /api/submissions
```

**Request Body:**
```json
{
  "title": "My Amazing Story",
  "content": "Once upon a time, in a land far away...",
  "authorName": "Aspiring Writer",
  "authorEmail": "writer@email.com",
  "category": "short-stories"
}
```

**Response (201):**
```json
{
  "message": "Submission received successfully! We will review it and get back to you.",
  "submission": {
    "id": "submission_id",
    "title": "My Amazing Story",
    "authorName": "Aspiring Writer",
    "category": "short-stories",
    "submittedAt": "2024-01-01T00:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Story",
    "content": "This is my story content...",
    "authorName": "Test Author",
    "authorEmail": "test@example.com",
    "category": "short-stories"
  }'
```

---

#### 2. Get All Submissions (Admin+)
```http
GET /api/submissions?page=1&limit=20&status=pending&category=short-stories
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Submissions per page
- `status` (optional): `pending`, `approved`, `rejected`
- `category` (optional): Filter by category

**Response (200):**
```json
{
  "submissions": [
    {
      "_id": "submission_id",
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
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### 3. Get Single Submission (Admin+)
```http
GET /api/submissions/{id}
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "_id": "submission_id",
  "title": "Story Title",
  "content": "Full story content...",
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

---

#### 4. Review Submission (Admin+)
```http
PUT /api/submissions/{id}/review
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Great story! Minor edits needed before publication."
}
```

**Response (200):**
```json
{
  "message": "Submission approved",
  "submission": {
    "_id": "submission_id",
    "title": "Story Title",
    "status": "approved",
    "reviewedBy": "admin_id",
    "reviewedAt": "2024-01-01T00:00:00Z",
    "notes": "Great story! Minor edits needed before publication."
  }
}
```

---

#### 5. Convert Submission to Post (Admin+)
```http
POST /api/submissions/{id}/convert-to-post
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "categoryId": "category_id",
  "tags": ["fiction", "drama", "contemporary"],
  "isDownloadable": true
}
```

**Response (200):**
```json
{
  "message": "Submission converted to post successfully",
  "post": {
    "_id": "new_post_id",
    "title": "Story Title",
    "slug": "story-title",
    "content": "Story content...",
    "category": {
      "_id": "category_id",
      "name": "Short Stories",
      "slug": "short-stories"
    },
    "author": {
      "_id": "admin_id",
      "name": "Admin Name",
      "email": "admin@email.com"
    },
    "status": "draft",
    "tags": ["fiction", "drama", "contemporary"],
    "isDownloadable": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 🔧 Admin (`/api/admin`)

#### 1. Get Dashboard Stats (Admin+)
```http
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
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
    "recentPosts": [
      {
        "_id": "post_id",
        "title": "Recent Post",
        "status": "published",
        "category": {
          "name": "Short Stories"
        },
        "author": {
          "email": "author@email.com"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "recentMembers": [
      {
        "_id": "member_id",
        "name": "New Member",
        "email": "member@email.com",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 2. Get Community Members (Admin+)
```http
GET /api/admin/members?page=1&limit=20&search=john
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Members per page
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "members": [
    {
      "_id": "member_id",
      "name": "John Doe",
      "email": "john@example.com",
      "joinedAt": "2024-01-01T00:00:00Z",
      "isActive": true,
      "emailVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "pages": 63
  }
}
```

---

#### 3. Update Member Status (Admin+)
```http
PUT /api/admin/members/{id}
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "Member status updated",
  "member": {
    "_id": "member_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": false
  }
}
```

---

#### 4. Get All Authors (Admin+)
```http
GET /api/admin/authors?page=1&limit=20&search=gift
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "authors": [
    {
      "_id": "author_id",
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
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### 5. Get All Posts (Admin View)
```http
GET /api/admin/posts?page=1&limit=20&status=draft&author=author_id
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Posts per page
- `status` (optional): `draft`, `published`, `archived`
- `author` (optional): Filter by author ID

**Response (200):**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "slug": "post-title",
      "status": "draft",
      "category": {
        "_id": "category_id",
        "name": "Short Stories",
        "slug": "short-stories"
      },
      "author": {
        "_id": "author_id",
        "name": "Gift Davies",
        "email": "gift@nistar.com"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

#### 6. Get Admin Users (Super Admin Only)
```http
GET /api/admin/users
Authorization: Bearer {super_admin_token}
```

**Response (200):**
```json
[
  {
    "_id": "user_id",
    "name": "Gift Davies",
    "email": "gift@nistar.com",
    "role": "super_admin",
    "isActive": true,
    "createdBy": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "_id": "admin_id",
    "name": "Admin User",
    "email": "admin@nistar.com",
    "role": "admin",
    "isActive": true,
    "createdBy": {
      "_id": "user_id",
      "name": "Gift Davies",
      "email": "gift@nistar.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 7. Deactivate User (Super Admin Only)
```http
PUT /api/admin/users/{id}/deactivate
Authorization: Bearer {super_admin_token}
```

**Response (200):**
```json
{
  "message": "User deactivated successfully"
}
```

---

#### 8. Delete User (Super Admin Only)
```http
DELETE /api/admin/users/{id}
Authorization: Bearer {super_admin_token}
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 👤 Profile (`/api/profile`)

#### 1. Get User Profile (Public)
```http
GET /api/profile/{id}
```

**Response (200):**
```json
{
  "user": {
    "_id": "user_id",
    "name": "Gift Davies",
    "email": "gift@nistar.com",
    "bio": "Award-winning author and storyteller with a passion for literary excellence...",
    "profileImage": "/uploads/gift-profile.jpg",
    "socialLinks": {
      "twitter": "https://twitter.com/giftdavies",
      "instagram": "https://instagram.com/giftdavies",
      "linkedin": "https://linkedin.com/in/giftdavies",
      "website": "https://giftdavies.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "posts": [
    {
      "_id": "post_id",
      "title": "Recent Post",
      "slug": "recent-post",
      "category": {
        "_id": "category_id",
        "name": "Think Pieces",
        "slug": "think-pieces"
      },
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "stats": {
    "totalPosts": 25,
    "totalDownloads": 1250
  }
}
```

---

#### 2. Get Own Profile (Authenticated)
```http
GET /api/profile/me/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "_id": "user_id",
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
    "role": "super_admin",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 3. Update Own Profile (Authenticated)
```http
PUT /api/profile/me
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
name: "Updated Name"
bio: "Updated bio text describing the author's background and interests..."
socialLinks: {"twitter": "https://twitter.com/newhandle", "website": "https://newwebsite.com"}
profileImage: [file] (optional)
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "Updated Name",
    "email": "gift@nistar.com",
    "bio": "Updated bio text describing the author's background and interests...",
    "profileImage": "/uploads/new-profile-image.jpg",
    "socialLinks": {
      "twitter": "https://twitter.com/newhandle",
      "instagram": "https://instagram.com/giftdavies",
      "linkedin": "https://linkedin.com/in/giftdavies",
      "website": "https://newwebsite.com"
    }
  }
}
```

---

### 📤 Upload (`/api/upload`)

#### 1. Upload Image (Authors+)
```http
POST /api/upload/image
Authorization: Bearer {author_token}
Content-Type: multipart/form-data
```

**Form Data:**
```
image: [file]
```

**Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/image-1234567890.jpg",
  "filename": "image-1234567890.jpg",
  "originalName": "my-image.jpg",
  "size": 1024000
}
```

**cURL Example:**
```bash
curl -X POST https://menuchah-api.onrender.com/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## Error Responses

All endpoints return consistent error formats:

**Validation Error (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "message": "Access denied. No token provided."
}
```

**Authorization Error (403):**
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

**Not Found Error (404):**
```json
{
  "message": "Post not found"
}
```

**Server Error (500):**
```json
{
  "message": "Something went wrong!",
  "error": "Detailed error message (in development only)"
}
```

---

## Testing Workflow

### 1. Basic Authentication Flow
```bash
# 1. Register a new author
curl -X POST https://menuchah-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Author", "email": "test@example.com", "password": "password123"}'

# 2. Login to get token
curl -X POST https://menuchah-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 3. Use token to access protected routes
curl -X GET https://menuchah-api.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Content Creation Flow
```bash
# 1. Get categories
curl -X GET https://menuchah-api.onrender.com/api/categories

# 2. Create a post
curl -X POST https://menuchah-api.onrender.com/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=My First Post" \
  -F "content=This is my first post content" \
  -F "category=CATEGORY_ID" \
  -F "status=published"

# 3. Get your posts
curl -X GET https://menuchah-api.onrender.com/api/posts/my-posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Community Interaction Flow
```bash
# 1. Join community
curl -X POST https://menuchah-api.onrender.com/api/community/join \
  -H "Content-Type: application/json" \
  -d '{"name": "Community Member", "email": "member@example.com"}'

# 2. Add a comment
curl -X POST https://menuchah-api.onrender.com/api/comments \
  -H "Content-Type: application/json" \
  -d '{"post": "POST_ID", "authorName": "Commenter", "content": "Great post!"}'

# 3. Get comments for a post
curl -X GET https://menuchah-api.onrender.com/api/comments/post/POST_ID
```

---

## Postman Collection

You can import this collection into Postman for easier testing:

```json
{
  "info": {
    "name": "Nistar API",
    "description": "Complete API collection for Nistar writing website"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://menuchah-api.onrender.com/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test Author\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

This comprehensive API documentation provides everything needed to test and integrate with the Nistar backend API.