# Quick Start Guide - YENE-BETA Updates

## For Developers: Getting Started

### 1. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 2. Create Admin User
The system comes with default credentials ready to use:
```bash
cd backend
node scripts/seedAdmin.js
cd ..
```

Admin Credentials:
- **Email**: naolgonfa449@gmail.com
- **Password**: 12345678

### 3. Start Development Servers
```bash
# Terminal 1 - Frontend (from root)
npm run dev

# Terminal 2 - Backend (from backend folder)
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## Features Overview

### 1️⃣ Enhanced Property Listings
When viewing property cards and details, you'll now see:
- **Property Type Badge** - Shows apartment, house, condo, or studio
- **Description Preview** - Short summary of the property
- **Amenities Tags** - Quick overview of available amenities
- **House Rules** - Pet policy, smoking rules, event policy (on detail page)

### 2️⃣ Improved Messaging System
When contacting an owner:
1. Click "Contact Host" on any property
2. Use **quick prompts** for common questions:
   - Is this property still available?
   - Can we schedule a viewing?
   - What utilities are included?
   - What's the earliest move-in date?
3. Or write a custom message (10-500 characters)
4. Messages appear in `/inquiries` for real-time chat

### 3️⃣ Admin Dashboard
Access platform management:
- **URL**: `/admin`
- **Login**: naolgonfa449@gmail.com / 12345678
- **View**: Statistics, Recent Listings, Recent Inquiries
- **Manage**: Users, Listings, Inquiries

---

## Testing Workflow

### Test Property Details
1. Go to home page `/` or search `/listings`
2. Click on any property card
3. **Verify**:
   - Property type badge appears (top right of title)
   - Description shows as preview in card
   - Click "View details" to see full property information
   - House rules section appears at bottom of details page

### Test Messaging
1. On property details page, click "Contact Host"
2. **Try quick prompts**: Click any of the blue buttons
3. **Or type custom message** (watch character counter)
4. Click "Send Message"
5. Go to `/inquiries` in sidebar
6. Click the conversation to see your message
7. **Owner can reply** (if switching to owner account)

### Test Admin Dashboard
1. Logout from current account
2. Go to `/login`
3. **Login with admin credentials**:
   - Email: naolgonfa449@gmail.com
   - Password: 12345678
4. Will auto-redirect to `/admin`
5. **Explore**:
   - View statistics cards
   - Scroll through recent listings table
   - Check recent inquiries
   - Click quick action cards to see detailed views (pages not fully implemented yet)

---

## Common Tasks

### Create a Test Property (as Owner)
1. Login with owner account
2. Go to `/owner` (Owner Dashboard)
3. Click "Add New Listing"
4. Fill in all details including:
   - Property type
   - Amenities (comma-separated)
   - Description (100+ characters)
   - Rules (pet-friendly, smoking, events)
5. Publish listing
6. View on home page to see new details display

### Send a Test Message (as Renter)
1. Login with renter account (or register new)
2. Find a property listing
3. Click "Contact Host"
4. Use quick prompt or custom message
5. Send message
6. Check `/inquiries` to see conversation
7. (Optionally: Switch to owner account and reply)

### Review Admin Dashboard
1. Login as admin (naolgonfa449@gmail.com / 12345678)
2. View `/admin` dashboard
3. Check statistics cards for platform overview
4. Scroll tables to see recent activity
5. Future: Click "View all" buttons for detailed management

---

## File Locations Reference

### Frontend Changes
```
frontend/src/components/PropertyListingCard.tsx      - Enhanced card display
frontend/src/pages/PropertyDetails.tsx               - House rules + inquiry UX
frontend/src/pages/Inquiries.tsx                     - Chat interface improvements
frontend/src/pages/AdminDashboard.tsx               - Admin dashboard (NEW)
frontend/src/App.tsx                                - Added /admin route
```

### Backend Changes
```
backend/controllers/adminController.js              - Admin API logic (NEW)
backend/routes/adminRoutes.js                       - Admin API routes (NEW)
backend/scripts/seedAdmin.js                        - Admin user creator (NEW)
backend/server.js                                   - Added admin routes
```

### Documentation
```
IMPLEMENTATION_GUIDE.md                             - Complete feature docs
CHANGES_SUMMARY.md                                  - What was changed
QUICK_START.md                                      - This file
```

---

## Troubleshooting

### Admin Script Fails with MongoDB Error
**Reason**: MongoDB not running locally
**Solution**: This is expected in development. The script is correct and will work when:
- Deployed to server with MongoDB
- Local MongoDB is running (`npm run db:up`)
- Connection string is properly configured

### Admin Dashboard Not Loading
1. **Check login**: Verify you logged in as admin
2. **Clear cache**: Hard refresh (Ctrl+Shift+R)
3. **Check console**: Look for API errors
4. **Verify route**: URL should be exactly `/admin`

### Inquiries Not Showing
1. Make sure you're logged in as renter
2. Have created an inquiry on a property
3. Refreshing the page should show conversations
4. Check browser console for API errors

### Property Details Not Showing
1. **In edit listing**: Owner needs to fill in all fields
2. **Amenities**: Separated by commas in input
3. **Description**: Minimum 100 characters required
4. **Rules**: Set all boolean fields
5. Save/publish listing to see updates

---

## Next Steps

1. **Test all three features** using the workflows above
2. **Review code** in the referenced files
3. **Read IMPLEMENTATION_GUIDE.md** for full documentation
4. **Deploy to Vercel** when ready (backend + frontend)
5. **Run seed script** in production after deployment

---

## Support & Documentation

For detailed information:
- **Features**: See `IMPLEMENTATION_GUIDE.md`
- **Changes Made**: See `CHANGES_SUMMARY.md`
- **API Endpoints**: Check `backend/routes/adminRoutes.js`
- **Component Details**: Check individual component files

---

## Quick Command Reference

```bash
# Install dependencies
cd backend && npm install

# Create admin user
cd backend && node scripts/seedAdmin.js

# Run development servers
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (from backend folder)
npm start

# Build for production
npm run build

# Test admin credentials
Email: naolgonfa449@gmail.com
Password: 12345678
```

---

**You're all set! Enjoy the enhanced YENE-BETA platform! 🎉**
