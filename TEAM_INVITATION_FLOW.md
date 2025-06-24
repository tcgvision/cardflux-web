# Team Invitation Flow Documentation

## Overview

The team invitation system uses Clerk's organization invitation feature combined with custom webhook handling to manage team memberships. This document outlines how the flow works and the recommended approach for different user scenarios.

## How It Works

### 1. Admin Sends Invitation
- Admin uses the team management interface to invite a user by email
- System creates a Clerk organization invitation
- User record is created/updated in our database with `shopId` but no `clerkId` yet
- Invitation email is sent to the user

### 2. User Accepts Invitation
- User clicks the invitation link in their email
- Link redirects to `/auth/sign-up?invitation=${shopId}`
- Clerk handles the invitation acceptance process

### 3. Webhook Processing
- `organizationMembership.created` webhook is triggered
- System links the user to the shop in our database
- User is redirected to the dashboard

## User Scenarios

### Scenario 1: New User (No Account)
**Recommended Flow: Accept invitation first, then create account**

1. **User receives invitation email**
2. **User clicks invitation link**
3. **Clerk automatically creates account** (no manual sign-up needed)
4. **Webhook links user to shop**
5. **User is redirected to dashboard**
6. **User can immediately access shop features**

**✅ This is the preferred flow for new users**

### Scenario 2: Existing User (Has Account)
**Recommended Flow: Accept invitation, then sign in**

1. **User receives invitation email**
2. **User clicks invitation link**
3. **User signs in to existing account**
4. **Webhook links user to shop**
5. **User is redirected to dashboard**
6. **User can immediately access shop features**

**✅ This is the preferred flow for existing users**

### Scenario 3: User Already in Another Shop
**Handled automatically by webhook**

1. **User accepts invitation to new shop**
2. **Webhook detects existing shop membership**
3. **System handles conflict resolution:**
   - If user owns current shop (only member): Delete current shop
   - If user is member of current shop: Remove from current shop
4. **User is linked to new shop**
5. **User is redirected to new shop dashboard**

## Edge Cases Handled

### User Creates Account Before Accepting Invitation
- Webhook handles linking existing user to shop
- No duplicate accounts created
- Seamless experience

### User Accepts Multiple Invitations
- Webhook prevents duplicate memberships
- Clear conflict resolution logic
- User can only be in one shop at a time

### Invitation Expires
- Clerk handles expiration automatically
- Admin can resend invitation if needed
- No orphaned records in database

## Technical Implementation

### Key Components

1. **Team Router** (`src/server/api/routers/team.ts`)
   - `inviteMember`: Creates Clerk invitation and database record
   - `getMembers`: Fetches team members with roles
   - `updateMemberRole`: Updates member roles
   - `removeMember`: Removes team members

2. **Webhook Handler** (`src/app/api/webhooks/route.ts`)
   - `organizationMembership.created`: Links users to shops
   - `organizationMembership.deleted`: Removes users from shops
   - `user.created`/`user.updated`: Manages user records

3. **Shop Membership Check** (`src/app/api/check-shop-membership/route.ts`)
   - Verifies user's shop membership status
   - Used for routing decisions

### Database Schema

```sql
-- User table tracks shop membership
users {
  id: number
  clerkId: string (nullable)
  email: string
  name: string (nullable)
  shopId: string (nullable) -- Links to shop
  createdAt: DateTime
  updatedAt: DateTime
}

-- Shop table (Clerk organization)
shops {
  id: string (Clerk org ID)
  name: string
  slug: string
  type: enum
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Best Practices

### For Admins
1. **Use email addresses** that users actually have access to
2. **Set appropriate roles** (Member vs Admin) based on needs
3. **Monitor pending invitations** and resend if needed
4. **Remove inactive members** to keep team clean

### For Users
1. **Accept invitation first** before creating account (if new user)
2. **Use the same email** that was invited
3. **Contact admin** if invitation expires or has issues
4. **Sign out** before accepting invitation to different shop

### For Developers
1. **Test both scenarios** (new user vs existing user)
2. **Monitor webhook logs** for debugging
3. **Handle edge cases** gracefully
4. **Provide clear error messages** to users

## Troubleshooting

### Common Issues

1. **"User already invited" error**
   - Check if invitation is pending in Clerk dashboard
   - Cancel and resend invitation if needed

2. **"User already a member" error**
   - User is already in the shop
   - Check team members list

3. **"User belongs to another shop" error**
   - User needs to leave current shop first
   - Admin can handle this via webhook logic

4. **Invitation link not working**
   - Check if invitation expired
   - Verify email address matches
   - Try resending invitation

### Debug Steps

1. **Check webhook logs** for membership creation events
2. **Verify user record** in database has correct `shopId`
3. **Check Clerk organization** membership status
4. **Test invitation flow** with different email addresses

## Security Considerations

1. **Email verification** is handled by Clerk
2. **Role-based permissions** prevent unauthorized access
3. **Shop isolation** ensures users can only access their assigned shop
4. **Webhook verification** prevents unauthorized membership changes
5. **Conflict resolution** prevents duplicate memberships

## Future Improvements

1. **Bulk invitations** for multiple users
2. **Custom invitation messages** with shop context
3. **Invitation analytics** and tracking
4. **Role templates** for common permission sets
5. **Integration with external identity providers** 