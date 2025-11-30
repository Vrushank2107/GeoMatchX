# 🚨 IMPORTANT: Fix Registration Errors

## The Problem
You're getting HTML error pages instead of JSON because:
1. **Prisma Client needs to be regenerated**
2. **Dev server MUST be restarted** after generating Prisma Client

## Quick Fix (2 Steps)

### Step 1: Generate Prisma Client
```bash
npm run db:generate
```

### Step 2: Restart Dev Server ⚠️ CRITICAL
**You MUST restart the dev server!**

1. **Stop** the current dev server (press `Ctrl+C` in the terminal where it's running)
2. **Start** it again:
   ```bash
   npm run dev
   ```

## Why Restart is Required

Next.js/Turbopack caches module imports. When you generate Prisma Client:
- The `.next` cache still references the old (missing) module
- Restarting clears the cache and loads the new Prisma Client
- Without restart, you'll keep getting the "Cannot find module" error

## After Restarting

Test registration:
1. Go to: `http://localhost:3000/auth/register-sme`
2. Fill in the form
3. Submit
4. Should work now! ✅

## If Still Not Working

### Option 1: Clear Next.js Cache
```bash
# Stop dev server first
rm -rf .next
npm run dev
```

### Option 2: Full Regeneration
```bash
# Stop dev server
rm -rf node_modules/.prisma
npm run db:generate
npm run dev
```

## Verification

After restarting, the API should:
- ✅ Return JSON (not HTML)
- ✅ Show proper error messages
- ✅ Allow registration/login

Check by visiting: `http://localhost:3000/api/health`
Should return: `{"status":"ok",...}`

## Summary

**The fix is simple but critical:**
1. `npm run db:generate` 
2. **RESTART dev server** ← Don't skip this!
3. Try registration again

The error happens because the dev server cached the missing Prisma Client module. Restarting clears the cache.

