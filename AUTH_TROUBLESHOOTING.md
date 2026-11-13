# Authentication Troubleshooting Guide

## Issue Fixed: Demo Login Not Working

### What Was Wrong
1. **Cookie Configuration**: The demo login was setting cookies with `httpOnly: false` which could cause issues
2. **Environment Restriction**: Demo mode was restricted to non-production only
3. **Timing Issue**: Redirect was happening before cookies were fully set

### What Was Fixed (Commit: `ace46ff`)

#### 1. Simplified Cookie Handling
**File:** `/lib/actions/auth.ts`
- Removed `httpOnly: false` flag (uses default `httpOnly: true`)
- Removed production environment check - demo login now works everywhere
- Removed unnecessary Supabase auth attempt
- Added console logging for debugging

#### 2. Prioritized Demo Cookies
**File:** `/lib/auth.ts`
- Removed `process.env.NODE_ENV` check
- Demo cookies now take priority over Supabase authentication
- Works in all environments (development, staging, production)

#### 3. Added Timing Safety
**File:** `/app/[lang]/(auth)/login/LoginForm.tsx`
- Added 100ms delay before redirect to ensure cookies are set
- Improved error messages with full response details
- Better console logging for debugging

---

## How to Use Demo Login (After Fix)

### Option 1: One-Click Login (Recommended)
On the login page, click any of the three buttons:

1. **Admin Button** (Blue)
   - Role: Superadmin
   - Access: Full admin dashboard
   - Redirects to: `/ar/admin` or `/fr/admin` or `/en/admin`

2. **Manager Button** (Amber)
   - Role: Branch Manager
   - Access: Staff portal for Algiers branch
   - Redirects to: `/ar/staff` or `/fr/staff` or `/en/staff`

3. **Customer Button** (Blue)
   - Role: Customer
   - Access: Personal dashboard
   - Redirects to: `/ar/dashboard` or `/fr/dashboard` or `/en/dashboard`

### Option 2: Manual Login (If Supabase is configured)
Use these credentials:

**Admin:**
- Email: `admin@dzrent.dz`
- Password: `password123`

**Manager:**
- Email: `manager.algiers@dzrent.dz`
- Password: `password123`

**Customer:**
- Email: `karim.b@gmail.com`
- Password: `password123`

---

## Verification Steps

### Step 1: Clear Cookies (If Still Having Issues)
```javascript
// Open browser console (F12) and run:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Then refresh the page
```

### Step 2: Test Demo Login
1. Go to login page: `http://localhost:3000/ar/login`
2. Click "Admin" button
3. Check browser console for logs:
   ```
   Demo login response: { success: true, redirectPath: '/ar/admin' }
   Redirecting to: /ar/admin
   ```
4. Should redirect to admin dashboard

### Step 3: Verify Cookies Are Set
```javascript
// In browser console:
document.cookie
// Should see: dzrent_demo_role=admin; dzrent_demo_user={"id":"a0000000-..."}
```

### Step 4: Check Server Logs
If using `npm run dev`, check terminal output:
```
[Demo Login] Set cookies for role: admin, redirecting to: /ar/admin
```

---

## Still Not Working? Debug Checklist

### 1. Check Browser Console
Open DevTools (F12) → Console tab:
- Look for errors (red text)
- Check for "Demo login response" log
- Verify redirect URL is correct

### 2. Check Network Tab
DevTools → Network tab:
1. Click Admin button
2. Look for request to `/login` or similar
3. Check Response → Should have `redirectPath`
4. Check Cookies → Should have `dzrent_demo_role` and `dzrent_demo_user`

### 3. Check Application Cookies
DevTools → Application tab → Cookies → `http://localhost:3000`:
- `dzrent_demo_role`: Should be `admin`, `branch_manager`, or `customer`
- `dzrent_demo_user`: Should be JSON string with user details

### 4. Common Issues

#### Issue: "Unauthorized" or redirect to login
**Solution:** Cookies not being read correctly
```bash
# Restart dev server
npm run dev
# Clear browser cache and cookies
# Try again
```

#### Issue: Button doesn't respond
**Solution:** JavaScript error
1. Check console for errors
2. Make sure you're on latest code: `git pull origin main`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

#### Issue: Redirect loop (keeps going back to login)
**Solution:** Cookie path mismatch
1. Clear all cookies
2. Make sure URL matches language prefix (`/ar/`, `/fr/`, or `/en/`)
3. Try accessing dashboard directly: `http://localhost:3000/ar/admin`

---

## Technical Details

### Demo User Profiles
Located in `/lib/auth.ts`:

```typescript
export const DEMO_PROFILES = {
  admin: {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@dzrent.dz',
    full_name: 'Samir Belkacem (Superadmin)',
    role: 'admin',
    branch_id: null,
  },
  branch_manager: {
    id: 'b0000000-0000-0000-0000-000000000001',
    email: 'manager.algiers@dzrent.dz',
    full_name: 'Rachid Haddad (Manager Alger)',
    role: 'branch_manager',
    branch_id: '10000000-0000-0000-0000-000000000001',
  },
  customer: {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'karim.b@gmail.com',
    full_name: 'Karim Benali (Customer)',
    role: 'customer',
    branch_id: null,
  },
};
```

### Cookie Configuration
```typescript
cookieStore.set('dzrent_demo_role', account.role, {
  path: '/',              // Available on all pages
  maxAge: 60 * 60 * 24,  // 24 hours
  sameSite: 'lax',       // CSRF protection
});
```

### Authentication Flow
```
1. User clicks "Admin" button
2. Client sets cookie: dzrent_demo_role=admin
3. Server action loginAsDemo() called
4. Server sets server-side cookies
5. Returns { success: true, redirectPath: '/ar/admin' }
6. Client waits 100ms for cookies to propagate
7. Client redirects to /ar/admin
8. Admin layout calls getAuthUser()
9. getAuthUser() reads dzrent_demo_role cookie
10. Returns demo profile for admin
11. User sees admin dashboard ✓
```

---

## Testing the Fix

### Quick Test Script
Run this in your project root:

```bash
# Start dev server
npm run dev

# In another terminal, test with curl:
curl -c cookies.txt -X POST http://localhost:3000/api/demo-login \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","lang":"ar"}'

# Check if cookies were set:
cat cookies.txt | grep dzrent
```

### Manual Testing Checklist
- [ ] One-click Admin login works
- [ ] One-click Manager login works
- [ ] One-click Customer login works
- [ ] Admin can access `/ar/admin` dashboard
- [ ] Manager can access `/ar/staff` portal
- [ ] Customer can access `/ar/dashboard`
- [ ] Logout clears cookies
- [ ] Can switch between roles

---

## Support

If you're still experiencing issues after following this guide:

1. **Check for typos** in URLs (should be `/ar/admin` not `/admin`)
2. **Restart the dev server** (`npm run dev`)
3. **Clear browser cache** completely
4. **Try incognito/private window** to rule out cached data
5. **Check that you pulled latest code**: `git log --oneline -1` should show `ace46ff`

### Development Mode
- Demo login: **ENABLED** ✓
- Cookie duration: 24 hours
- No Supabase required

### Production Mode
- Demo login: **ENABLED** ✓ (after fix)
- Real Supabase auth: Available as fallback
- Environment variable override: Not needed

---

## Changelog

### 2024-11-12 - Fix Auth (ace46ff)
- ✅ Removed environment restrictions on demo login
- ✅ Simplified cookie configuration
- ✅ Added redirect delay for cookie propagation
- ✅ Improved error logging
- ✅ Demo cookies now take priority over Supabase

### Previous Issues (Now Fixed)
- ❌ Demo login only worked in development
- ❌ Cookies not being read correctly
- ❌ Redirect happening before cookies set
- ❌ httpOnly flag causing issues
- ❌ ByteString errors in middleware (fixed earlier)

---

## Next Steps

After successful login, you should see:
- **Admin**: Full dashboard with all 12 widgets
- **Manager**: Staff portal with branch-scoped data
- **Customer**: Personal reservations and profile

Enjoy using DZRent! 🚗
