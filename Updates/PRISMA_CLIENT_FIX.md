# Fix: Prisma Client Not Found Error

## Problem
```
Cannot find module '.prisma/client/default'
```

This error occurs because:
1. Prisma Client wasn't generated properly
2. The dev server needs to be restarted after generating Prisma Client
3. Prisma 7 with Next.js 16/Turbopack has specific requirements

## Solution

### Step 1: Generate Prisma Client
```bash
npm run db:generate
```

### Step 2: Restart Dev Server
**IMPORTANT**: You MUST restart the dev server after generating Prisma Client!

1. Stop the current dev server (Ctrl+C)
2. Start it again:
```bash
npm run dev
```

### Step 3: Verify
After restarting, test the API:
```bash
curl -X POST http://localhost:3000/api/auth/register-sme \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","email":"test@test.com","password":"test12345","hqCity":"Mumbai"}'
```

Should return JSON, not HTML.

## Why This Happens

Next.js/Turbopack caches module imports. When Prisma Client is generated:
1. The `.next` cache still has the old (missing) module reference
2. Restarting clears the cache and reloads the newly generated client
3. The API routes can then import Prisma Client successfully

## Alternative: Clear Next.js Cache

If restarting doesn't work:
```bash
# Stop dev server
# Then:
rm -rf .next
npm run dev
```

## Verification

After restarting, check:
1. ✅ No HTML error pages
2. ✅ API returns JSON responses
3. ✅ Registration/login works
4. ✅ No "Cannot find module" errors in server logs

## If Still Not Working

1. **Check Prisma Client exists**:
   ```bash
   ls -la node_modules/.prisma/client/
   ```

2. **Regenerate and restart**:
   ```bash
   rm -rf node_modules/.prisma
   npm run db:generate
   # Restart dev server
   ```

3. **Check DATABASE_URL** (for runtime, not generation):
   ```bash
   # Should be set in .env
   cat .env | grep DATABASE_URL
   ```

4. **Check server logs** for specific errors

