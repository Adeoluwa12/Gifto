# Nistar - Frontend Development Specification

## Project Overview
Nistar is a premium personal writing website for Gift Davies, showcasing literary works with community features, admin management, and story submissions. The design emphasizes elegance, sophistication, and readability with a luxurious aesthetic.

## Author Information
- **Author Name**: Gift Davies
- **Profile Image**: `/public/gift.jpg`
- **About Page**: Feature prominent author photo and biography

## Design System

### Color Palette
- **Primary Background**: Pure White (#FFFFFF)
- **Sage Green**: 
  - Primary: #9CAF88
  - Dark: #6B8E5A
  - Light: #B8C5A6
- **Beige**: 
  - Primary: #F5F5DC
  - Warm: #E6D7C3
  - Rich: #D2B48C
- **Typography Colors**: 
  - Primary Text: #2C2C2C
  - Secondary Text: #5A5A5A
  - Light Text: #8A8A8A

### Typography
- **Primary Font**: Spectral (Google Fonts)
- **Font Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Font Hierarchy**:
  - H1: 3rem (48px) - Spectral 600
  - H2: 2.25rem (36px) - Spectral 600
  - H3: 1.875rem (30px) - Spectral 500
  - H4: 1.5rem (24px) - Spectral 500
  - Body Large: 1.125rem (18px) - Spectral 400
  - Body: 1rem (16px) - Spectral 400
  - Small: 0.875rem (14px) - Spectral 400

### Layout & Spacing
- **Container Max Width**: 1400px
- **Content Max Width**: 800px (for reading)
- **Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- **Border Radius**: 8px (standard), 12px (cards), 24px (large elements)

## API Configuration

### Base URL
```
Production: https://menuchah-api.onrender.com/api
```

### Authentication
```javascript
// Include JWT token in all authenticated requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## Pages & Components

### 1. Homepage (`/`)

**Hero Section:**
- Large, elegant typography with "Gift Davies" as author name
- Sophisticated tagline about literary excellence
- Subtle sage green accent elements
- Call-to-action button with beige background

**Featured Posts:**
- Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Elegant post cards with hover effects
- Category badges in sage green
- Read time indicators

**Community Join Modal:**
- **Trigger**: After 45 seconds on page OR after scrolling 60% of page
- Minimal, elegant design with backdrop blur
- Sage green submit button
- Store in localStorage to prevent re-showing
- Form fields: Name (required), Email (required)

**API Calls:**
```javascript
GET /posts?limit=6&status=published
GET /categories
POST /community/join
```

---

### 2. About Page (`/about`)

**Layout:**
- **Hero Section**: Large professional photo of Gift Davies (`/public/gift.jpg`)
- **Biography Section**: Elegant typography with Gift's story
- **Writing Journey**: Timeline or narrative format
- **Achievements**: Published works, awards, recognition
- **Personal Touch**: Writing philosophy, inspiration sources

**Design Elements:**
- Generous white space around author photo
- Beige background sections for biography
- Sage green accent dividers
- Professional photography styling
- Social media links with elegant hover states

---

### 3. Posts Page (`/posts`)

**Advanced Filtering:**
- **Category Filter**: Dropdown with all categories
- **Search Bar**: Real-time search with debouncing
- **Sort Options**: 
  - Newest First
  - Oldest First
  - Most Popular (by download count)
  - Most Commented
- **Tag Filter**: Popular tags cloud
- **Date Range**: Filter by publication date

**Post Grid:**
- Masonry layout for visual interest
- Hover effects with subtle elevation
- Category badges with color coding
- Author info with small avatar
- Excerpt previews (150 characters)
- Read time calculation
- Download count (if downloadable)

**API Calls:**
```javascript
GET /posts?page=1&limit=12&category={slug}&search={query}&sort={option}&tags={tags}&dateFrom={date}&dateTo={date}
GET /categories
```

---

### 4. Single Post (`/posts/[slug]`)

**Post Header:**
- Large, elegant title with Spectral font
- Author info with Gift's photo and bio snippet
- Publication date and last updated
- Category badge and tags
- Read time estimate
- Social sharing buttons (Twitter, Facebook, LinkedIn, Copy Link)

**Content Area:**
- **Reading Width**: Max 800px for optimal readability
- **Custom Typography**: Apply post's fontSettings from backend
- **Image Handling**: Full-width images with captions
- **Table of Contents**: Auto-generated for long posts
- **Progress Indicator**: Reading progress bar

**EPUB Download Section:**
- **Visibility**: Only show if `post.isDownloadable === true`
- **Download Button**: Prominent sage green button
- **Download Stats**: Show download count
- **Progress**: Loading state during download
- **Success State**: Confirmation message

**Comments Section:**
- **Anonymous Commenting**: Name required, email optional
- **Nested Replies**: Up to 3 levels deep
- **Admin Approval**: "Pending approval" message
- **Comment Form**: Rich text editor for formatting
- **Reply Threading**: Clear visual hierarchy

**Related Posts:**
- Show 3-4 related posts from same category
- Elegant card layout
- "More from Gift Davies" section

**API Calls:**
```javascript
GET /posts/{slug}
GET /comments/post/{postId}
POST /comments
GET /posts/{slug}/download
GET /posts?category={categoryId}&limit=4&exclude={currentPostId}
```

---

### 5. Categories Management

**Public Category Page (`/categories`):**
- **Category Grid**: Visual cards with descriptions
- **Post Counts**: Number of posts in each category
- **Category Images**: Featured image for each category
- **Filter Links**: Direct links to filtered post views

**Category Details (`/categories/[slug]`):**
- **Category Header**: Name, description, post count
- **Featured Posts**: Top posts in this category
- **All Posts**: Paginated list of category posts
- **Category Stats**: Total posts, total downloads

**API Calls:**
```javascript
GET /categories
GET /categories/{slug}
GET /posts?category={slug}&page=1&limit=12
```

---

### 6. Submissions Page (`/submissions`)

**Submission Guidelines:**
- **Clear Instructions**: What types of stories are accepted
- **Category Descriptions**: Detailed explanation of each category
- **Formatting Requirements**: Word count, style guidelines
- **Review Process**: Timeline and expectations

**Submission Form:**
- **Multi-Step Form**: 
  1. Story Details (title, category, description)
  2. Content (rich text editor)
  3. Author Info (name, email, bio)
  4. Review & Submit
- **Auto-Save**: Save draft as user types
- **File Upload**: Support for document uploads
- **Preview Mode**: Show how story will appear

**API Calls:**
```javascript
POST /submissions
GET /categories
```

---

### 7. Community Page (`/community`)

**Community Overview:**
- **Member Benefits**: What members get (early access, newsletters, etc.)
- **Community Stats**: Total members, recent activity
- **Member Testimonials**: Quotes from community members
- **Join Form**: Prominent signup form

**Community Guidelines:**
- **Code of Conduct**: Community rules and expectations
- **Participation Guidelines**: How to engage respectfully
- **Content Policy**: What's allowed in comments and submissions

**API Calls:**
```javascript
POST /community/join
GET /community/stats
```

---

### 8. Contact Page (`/contact`)

**Contact Information:**
- **Professional Email**: For business inquiries
- **Social Media**: Links to all platforms
- **Response Time**: Expected reply timeframe

**Contact Form:**
- **Form Fields**: Name, Email, Subject, Message
- **Message Categories**: General, Business, Media, Collaboration
- **File Attachment**: Support for document uploads
- **Auto-Response**: Confirmation email

**Location (Optional):**
- **General Location**: City/Country if applicable
- **Time Zone**: For scheduling purposes

---

### 9. User Profiles & Authentication

**Author Profile (`/profile/[id]`):**
- **Public Profile**: Name, bio, profile image
- **Published Posts**: List of author's published works
- **Author Stats**: Total posts, total downloads, join date
- **Social Links**: Twitter, Instagram, LinkedIn, Website

**Profile Management (`/profile/me`):**
- **Edit Profile**: Update name, bio, profile image
- **Social Links**: Manage social media connections
- **Account Settings**: Email, password change
- **Privacy Settings**: Profile visibility options

**Authentication Pages:**
- **Login (`/auth/login`)**: Clean, minimal form
- **Register (`/auth/register`)**: Author registration with profile setup
- **Password Reset**: Email-based password recovery

**API Calls:**
```javascript
GET /profile/{id}
GET /profile/me/profile
PUT /profile/me
POST /auth/login
POST /auth/register
GET /auth/me
PUT /auth/change-password
```

---

### 10. Author Dashboard (`/dashboard`)

**Dashboard Overview:**
- **Quick Stats**: Total posts, views, downloads, comments
- **Recent Activity**: Latest comments, new followers
- **Performance Metrics**: Most popular posts, engagement rates
- **Quick Actions**: Create new post, view analytics

**My Posts Management:**
- **Posts Table**: Title, status, category, published date, stats
- **Bulk Actions**: Publish, archive, delete multiple posts
- **Status Filters**: Draft, published, archived
- **Search & Sort**: Find posts quickly

**Post Editor:**
- **Rich Text Editor**: Full-featured editor with Spectral font
- **Image Management**: Upload and insert images
- **SEO Settings**: Meta description, tags, featured image
- **Publishing Options**: Schedule posts, set as downloadable
- **Preview Mode**: See how post will appear to readers
- **Auto-Save**: Prevent data loss

**Analytics Dashboard:**
- **Post Performance**: Views, downloads, comments per post
- **Audience Insights**: Reader demographics, popular categories
- **Engagement Metrics**: Comment rates, download rates
- **Traffic Sources**: Where readers are coming from

**API Calls:**
```javascript
GET /posts/my-posts
POST /posts
PUT /posts/{id}
DELETE /posts/{id}
POST /upload/image
GET /admin/dashboard (for personal stats)
```

---

### 11. Admin Dashboard (`/admin`)

**Admin Overview:**
- **System Stats**: Total users, posts, comments, submissions
- **Recent Activity**: New registrations, pending content
- **Quick Actions**: Approve comments, review submissions
- **System Health**: Server status, database metrics

**Content Management:**

**Posts Management:**
- **All Posts Table**: Title, author, status, category, date
- **Bulk Operations**: Publish, archive, delete multiple posts
- **Advanced Filters**: Author, category, status, date range
- **Post Editor**: Edit any post with full permissions
- **Featured Posts**: Mark posts as featured for homepage

**Author Management:**
- **Authors List**: Name, email, posts count, join date, status
- **Author Details**: View full profile, post history, statistics
- **Account Actions**: Activate/deactivate, reset password
- **Role Management**: Promote to admin (if super admin)
- **Communication**: Send messages to authors

**Community Management:**
- **Members List**: Name, email, join date, status, activity
- **Member Search**: Find members by name or email
- **Bulk Actions**: Export member list, send newsletters
- **Member Analytics**: Growth charts, engagement metrics
- **Communication Tools**: Send announcements, newsletters

**Comment Moderation:**
- **Pending Comments**: Queue of comments awaiting approval
- **Comment History**: All comments with approval status
- **Bulk Moderation**: Approve/reject multiple comments
- **Comment Analytics**: Most active posts, comment trends
- **Spam Detection**: Flagged comments for review

**Submission Review:**
- **Pending Submissions**: Queue of story submissions
- **Submission Details**: Full story content, author info
- **Review Actions**: Approve, reject, request changes
- **Convert to Post**: Turn approved submissions into posts
- **Communication**: Send feedback to submitters

**API Calls:**
```javascript
GET /admin/dashboard
GET /admin/posts?page=1&limit=20&author={id}&status={status}
GET /admin/authors?page=1&limit=20&search={query}
GET /admin/members?page=1&limit=20&search={query}
GET /comments/pending?page=1&limit=20
GET /comments?page=1&limit=20&status={status}&post={id}
PUT /comments/{id}/approve
DELETE /comments/{id}
GET /submissions?page=1&limit=20&status={status}
PUT /submissions/{id}/review
POST /submissions/{id}/convert-to-post
```

---

### 12. Super Admin Panel (`/super-admin`)

**System Administration:**

**Admin User Management:**
- **Admin List**: All admin users with roles and permissions
- **Create Admin**: Add new admin users with role selection
- **Admin Permissions**: Manage what each admin can access
- **Admin Activity**: Log of admin actions and changes
- **Security Settings**: Two-factor authentication, login restrictions

**Category Management:**
- **Categories List**: All categories with post counts
- **Create Category**: Add new categories with descriptions
- **Edit Categories**: Update names, descriptions, order
- **Category Analytics**: Most popular categories, growth trends
- **Category Images**: Upload featured images for categories

**System Settings:**
- **Site Configuration**: Site name, description, contact info
- **Email Settings**: SMTP configuration, email templates
- **File Upload**: Maximum file sizes, allowed file types
- **Security Settings**: Rate limiting, CORS configuration
- **Backup Management**: Database backups, restore options

**Analytics & Reporting:**
- **User Analytics**: Registration trends, user activity
- **Content Analytics**: Post performance, popular categories
- **System Performance**: Server metrics, response times
- **Export Tools**: Generate reports, export data

**API Calls:**
```javascript
GET /admin/users
POST /auth/create-admin
PUT /admin/users/{id}
DELETE /admin/users/{id}
GET /categories (admin view with stats)
POST /categories
PUT /categories/{id}
DELETE /categories/{id}
GET /admin/system-stats
PUT /admin/settings
```

---

## Component Specifications

### Navigation Header
- **Logo**: "Nistar" in elegant Spectral font
- **Navigation Items**: Home, About, Posts, Categories, Community, Contact
- **User Menu**: Profile, Dashboard, Logout (when authenticated)
- **Mobile Menu**: Elegant slide-out navigation
- **Search**: Global search functionality

### Post Card Component
```javascript
{
  _id: "post_id",
  title: "Post Title",
  excerpt: "Post excerpt (150 chars)...",
  category: { name: "Category", slug: "category", color: "#9CAF88" },
  author: { 
    name: "Gift Davies", 
    profileImage: "/public/gift.jpg" 
  },
  readTime: 5,
  publishedAt: "2024-01-01T00:00:00Z",
  featuredImage: "/uploads/image.jpg",
  downloadCount: 25,
  isDownloadable: true,
  commentCount: 12
}
```

### Comment Component
```javascript
{
  _id: "comment_id",
  authorName: "Commenter Name",
  authorEmail: "email@example.com",
  content: "Comment content with possible HTML formatting",
  createdAt: "2024-01-01T00:00:00Z",
  isApproved: true,
  parentComment: null,
  replies: [
    {
      _id: "reply_id",
      authorName: "Reply Author",
      content: "Reply content",
      createdAt: "2024-01-01T00:00:00Z"
    }
  ]
}
```

### User Profile Component
```javascript
{
  _id: "user_id",
  name: "Gift Davies",
  email: "gift@nistar.com",
  bio: "Award-winning author and storyteller...",
  profileImage: "/public/gift.jpg",
  socialLinks: {
    twitter: "https://twitter.com/giftdavies",
    instagram: "https://instagram.com/giftdavies",
    linkedin: "https://linkedin.com/in/giftdavies",
    website: "https://giftdavies.com"
  },
  role: "super_admin",
  createdAt: "2024-01-01T00:00:00Z",
  stats: {
    totalPosts: 45,
    totalDownloads: 1250
  }
}
```

---

## User Roles & Detailed Permissions

### Visitor (Unauthenticated)
- **Read Access**: All published posts, categories, about page
- **Community**: Join community, view community page
- **Comments**: Add comments (with name/email)
- **Submissions**: Submit stories for review
- **Downloads**: Download EPUB files (if enabled)

### Author (Authenticated User)
- **All Visitor Permissions**
- **Profile Management**: Edit own profile, upload profile image
- **Content Creation**: Create, edit, delete own posts
- **Dashboard Access**: Personal analytics and post management
- **Image Upload**: Upload images for posts
- **Advanced Comments**: Comment with authenticated identity

### Admin
- **All Author Permissions**
- **Content Moderation**: Approve/reject all comments
- **User Management**: View all authors, manage author accounts
- **Community Management**: Manage community members
- **Submission Review**: Review and approve story submissions
- **Post Management**: Edit/delete any post
- **Analytics Access**: View site-wide analytics

### Super Admin (Gift Davies)
- **All Admin Permissions**
- **Admin Management**: Create, edit, delete admin users
- **Category Management**: Create, edit, delete categories
- **System Settings**: Configure site settings, email, security
- **Full Analytics**: Access to all system metrics and reports
- **Backup Management**: Database backups and system maintenance

---

## Special Features Implementation

### Community Join Modal
```javascript
// Trigger Logic
const showModal = () => {
  const hasJoined = localStorage.getItem('community_joined');
  const modalShown = sessionStorage.getItem('modal_shown');
  
  if (!hasJoined && !modalShown) {
    // Show after 45 seconds OR 60% scroll
    setTimeout(() => showCommunityModal(), 45000);
    
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 60) {
        showCommunityModal();
      }
    });
  }
};

// After successful join
const onJoinSuccess = () => {
  localStorage.setItem('community_joined', 'true');
  sessionStorage.setItem('modal_shown', 'true');
};
```

### EPUB Download with Progress
```javascript
const downloadEPUB = async (slug) => {
  setDownloading(true);
  try {
    const response = await fetch(`/api/posts/${slug}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.epub`;
      a.click();
      
      // Show success message
      showNotification('EPUB downloaded successfully!', 'success');
    }
  } catch (error) {
    showNotification('Download failed. Please try again.', 'error');
  } finally {
    setDownloading(false);
  }
};
```

### Rich Text Editor Configuration
```javascript
const editorConfig = {
  fontFamily: 'Spectral, serif',
  fontSize: '16px',
  lineHeight: '1.6',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
    'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code preview',
  content_style: `
    body { 
      font-family: Spectral, serif; 
      font-size: 16px; 
      line-height: 1.6; 
      color: #2C2C2C;
    }
  `
};
```

---

## API Response Formats

### Enhanced Post Object
```javascript
{
  "_id": "post_id",
  "title": "The Art of Storytelling",
  "slug": "art-of-storytelling",
  "description": "Exploring the fundamental elements that make stories captivating",
  "content": "Full post content with HTML formatting...",
  "excerpt": "A brief glimpse into the world of narrative craft...",
  "category": {
    "_id": "category_id",
    "name": "Think Pieces",
    "slug": "think-pieces",
    "description": "Analytical and reflective essays"
  },
  "author": {
    "_id": "author_id",
    "name": "Gift Davies",
    "email": "gift@nistar.com",
    "profileImage": "/public/gift.jpg",
    "bio": "Award-winning author and storyteller"
  },
  "status": "published",
  "publishedAt": "2024-01-15T10:30:00Z",
  "featuredImage": "/uploads/storytelling-hero.jpg",
  "imageUrl": null,
  "tags": ["writing", "craft", "storytelling", "literature"],
  "readTime": 8,
  "fontSettings": {
    "fontFamily": "Spectral, serif",
    "fontSize": 18,
    "lineHeight": 1.7
  },
  "downloadCount": 156,
  "isDownloadable": true,
  "commentCount": 23,
  "viewCount": 1247,
  "createdAt": "2024-01-10T14:20:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Dashboard Statistics
```javascript
{
  "stats": {
    "totalPosts": 45,
    "publishedPosts": 38,
    "draftPosts": 7,
    "totalViews": 15420,
    "totalDownloads": 2340,
    "totalComments": 456,
    "totalMembers": 1250,
    "pendingComments": 12,
    "pendingSubmissions": 8
  },
  "recentActivity": {
    "recentPosts": [...],
    "recentComments": [...],
    "recentMembers": [...]
  },
  "analytics": {
    "popularPosts": [...],
    "categoryStats": [...],
    "monthlyGrowth": {...}
  }
}
```

---

This comprehensive specification provides all the detailed functionality needed to build Nistar as a sophisticated literary website for Gift Davies, with robust admin capabilities and elegant user experience.