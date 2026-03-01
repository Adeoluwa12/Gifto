# Phase 1 - TODO List

## ❌ Missing Features to Implement

### 🔴 HIGH PRIORITY (Production Critical)

#### 1. Email Verification System
**Why:** Security and spam prevention
**Endpoints to create:**
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email

**Implementation:**
- Add `emailVerified` boolean to User model
- Generate verification token on registration
- Send verification email with link
- Verify token and mark email as verified
- Prevent unverified users from certain actions (optional)

---

#### 2. Password Reset Flow
**Why:** Users forget passwords - critical for production
**Endpoints to create:**
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

**Implementation:**
- Generate reset token (expires in 1 hour)
- Send reset email with link
- Validate token and allow password change
- Invalidate token after use

---

#### 3. User Account Deletion (Soft Delete)
**Why:** GDPR compliance, user privacy
**Endpoints to create:**
- `DELETE /users/me` - User can delete own account

**Implementation:**
- Soft delete (set `isActive: false`)
- Keep data for audit trail
- Anonymize personal data (optional)
- Prevent login after deletion
- Option to restore account (optional)

---

### 🟡 MEDIUM PRIORITY (Nice to Have)

#### 4. Download History Tracking
**Why:** User engagement, analytics
**Endpoints to create:**
- `GET /users/me/downloads` - Get user's download history

**Implementation:**
- Create `downloads` collection/model
- Track: user, post, timestamp, IP (optional)
- Link downloads to user accounts
- Show in user dashboard

**Schema:**
```javascript
{
  user: ObjectId,
  post: ObjectId,
  downloadedAt: Date,
  ipAddress: String (optional)
}
```

---

#### 5. Featured Posts
**Why:** Highlight important content
**Endpoints to create:**
- `GET /posts/featured` - Get featured posts
- `PATCH /posts/:id/feature` - Mark post as featured (admin)

**Implementation:**
- Add `isFeatured` boolean to Post model
- Admin can toggle featured status
- Show featured posts on homepage
- Limit to X featured posts

---

#### 6. User Dashboard
**Why:** Better user experience
**Endpoints to create:**
- `GET /dashboard/user` - User dashboard data

**Response:**
```javascript
{
  profile: { /* User profile summary */ },
  recentComments: [ /* User's recent comments */ ],
  downloadHistory: [ /* Recent downloads */ ],
  stats: {
    totalComments: 10,
    totalDownloads: 5
  }
}
```

---

#### 7. Author Dashboard
**Why:** Better author experience
**Endpoints to create:**
- `GET /dashboard/author` - Author dashboard data

**Response:**
```javascript
{
  stats: {
    totalPosts: 25,
    publishedPosts: 20,
    draftPosts: 5,
    totalViews: 1500,
    totalDownloads: 300,
    totalComments: 45
  },
  recentPosts: [ /* Recent posts */ ],
  recentComments: [ /* Comments on author's posts */ ]
}
```

---

### 🟢 LOW PRIORITY (Future Enhancement)

#### 8. Role Management
**Why:** Flexible user management
**Endpoints to create:**
- `PATCH /users/:id/role` - Change user role (admin only)

**Implementation:**
- Admin can change user roles
- Validate role transitions
- Log role changes
- Notify user of role change

---

#### 9. Token Refresh
**Why:** Better security with short-lived tokens
**Endpoints to create:**
- `POST /auth/refresh` - Refresh access token

**Implementation:**
- Issue short-lived access tokens (15 min)
- Issue long-lived refresh tokens (7 days)
- Store refresh tokens securely
- Rotate refresh tokens on use

**Note:** Currently using 7-day access tokens, so not urgent

---

#### 10. Logout with Token Blacklist
**Why:** Immediate token invalidation
**Endpoints to create:**
- `POST /auth/logout` - Logout and blacklist token

**Implementation:**
- Store blacklisted tokens in Redis
- Check blacklist on each request
- Auto-expire after token expiration

**Note:** Currently handled client-side, so not urgent

---

## 📋 Implementation Order Recommendation

1. **Password Reset** (Most requested feature)
2. **Email Verification** (Security)
3. **User Account Deletion** (GDPR compliance)
4. **Featured Posts** (Quick win, high impact)
5. **Download History** (Analytics)
6. **Author Dashboard** (Better UX)
7. **User Dashboard** (Better UX)
8. **Role Management** (Admin convenience)
9. **Token Refresh** (Security enhancement)
10. **Logout Endpoint** (Nice to have)

---

## 🎯 Quick Wins (Can be done in 1-2 hours each)

- Featured Posts
- Download History
- Author Dashboard
- User Dashboard

---

## 📝 Notes

- All core publishing features are complete ✅
- Missing features are enhancements, not blockers
- Can launch Phase 1 without these features
- Prioritize based on user feedback
- Some features can be added in Phase 1.5

---

## ✅ What's Already Done

- ✅ Complete authentication system (register, login, change password)
- ✅ Full post management (CRUD, EPUB download)
- ✅ Category management
- ✅ Comment system with moderation
- ✅ Story submissions workflow
- ✅ Admin dashboard with stats
- ✅ User profiles
- ✅ Community/mailing list
- ✅ File uploads
- ✅ Role-based access control

**Completion:** ~80% of Phase 1 scope
