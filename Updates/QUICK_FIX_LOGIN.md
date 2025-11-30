# Quick Fix: Login & Registration Failures

## 🔴 Most Common Issue: Missing DATABASE_URL

If you're seeing "Failed to login" or "Failed to create account", the most likely cause is that the database is not configured.

## ✅ Quick Fix Steps

### Step 1: Create .env File
Create a file named `.env` in the project root (`/Users/bharat/Downloads/geomatchxapp-main/.env`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/geomatchx"
```

**Replace with your actual database credentials:**
- `postgres` → your PostgreSQL username
- `password` → your PostgreSQL password  
- `localhost:5432` → your database host and port
- `geomatchx` → your database name

### Step 2: Ensure Database Exists
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (if it doesn't exist)
CREATE DATABASE geomatchx;

# Exit psql
\q
```

### Step 3: Set Up Database Schema
```bash
# Option 1: Use the setup script
npm run db:setup

# Option 2: Or manually
npm run db:push
npm run db:generate
```

### Step 4: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Verify Setup

### Check Environment Variables
```bash
npm run check
```

### Test Database Connection
Visit: http://localhost:3000/api/health

Should return: `{"status":"ok","message":"Database connection successful"}`

### Test Registration
1. Go to: http://localhost:3000/auth/register-worker
2. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test12345" (8+ characters)
   - City: "Delhi"
   - Skill Focus: "Electrician"
3. Submit

### Test Login
1. Go to: http://localhost:3000/auth/login-worker
2. Use the email and password you registered with
3. Should login successfully

## 🐛 Common Error Messages & Fixes

### "Database not configured"
**Fix**: Create `.env` file with `DATABASE_URL`

### "Database connection error"
**Fix**: 
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### "Missing required environment variable: DATABASE_URL"
**Fix**: Add DATABASE_URL to `.env` file and restart server

### "Password column doesn't exist"
**Fix**: Run `npm run db:push` to update schema

### "Invalid email or password"
**Possible causes**:
- User doesn't exist (register first)
- Wrong password
- User has no password set (old data)

**Fix**: Register a new account or check credentials

## 📋 Complete Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `geomatchx` created
- [ ] PostGIS extension installed
- [ ] `.env` file created with DATABASE_URL
- [ ] Database schema updated (`npm run db:push`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Development server restarted

## 🚀 After Setup

Once everything is configured:
1. Registration should work
2. Login should work
3. You should be able to access protected pages
4. API endpoints should respond correctly

## 💡 Still Not Working?

1. **Check server terminal** - Look for error messages
2. **Check browser console** - Look for network errors
3. **Run diagnostic**: `npm run check`
4. **Test health endpoint**: Visit `/api/health`
5. **Check database**: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"`

## 📞 Need More Help?

See `TROUBLESHOOTING.md` for detailed troubleshooting steps.

