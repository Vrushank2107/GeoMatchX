# Troubleshooting Login & Registration Failures

## Common Issues and Solutions

### Issue 1: "Failed to login" or "Failed to create account"

**Most Common Cause**: Database connection not configured

**Solution**:
1. Create a `.env` file in the project root
2. Add your database connection string:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/geomatchx"
   ```
3. Replace with your actual database credentials

### Issue 2: "Database connection error"

**Possible Causes**:
- Database server not running
- Wrong database credentials
- Database doesn't exist
- PostGIS extension not installed

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Test database connection:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. Create database if it doesn't exist:
   ```bash
   createdb geomatchx
   ```

4. Install PostGIS extension:
   ```bash
   psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

### Issue 3: "Missing required environment variable: DATABASE_URL"

**Solution**:
1. Create `.env` file in project root
2. Add DATABASE_URL
3. Restart the development server

### Issue 4: "Password column doesn't exist"

**Solution**:
1. Update database schema:
   ```bash
   npm run db:push
   ```

2. Or run the migration SQL:
   ```bash
   psql $DATABASE_URL < scripts/add-password-column.sql
   ```

3. Regenerate Prisma client:
   ```bash
   npm run db:generate
   ```

### Issue 5: "Invalid email or password" (but credentials are correct)

**Possible Causes**:
- User doesn't have a password set (old data)
- Password hash mismatch
- Database connection issues

**Solution**:
1. Check if user exists in database:
   ```sql
   SELECT user_id, email, password IS NOT NULL as has_password FROM users WHERE email = 'your@email.com';
   ```

2. If password is NULL, user needs to register again or reset password

### Issue 6: Prisma Client Errors

**Solution**:
1. Regenerate Prisma client:
   ```bash
   npm run db:generate
   ```

2. Check Prisma schema is correct:
   ```bash
   npx prisma validate
   ```

## Quick Diagnostic Steps

### Step 1: Check Environment Variables
```bash
# Check if .env file exists
ls -la .env

# Check if DATABASE_URL is set (in terminal)
echo $DATABASE_URL
```

### Step 2: Test Database Connection
```bash
# If DATABASE_URL is set, test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Step 3: Check Database Schema
```bash
# Check if password column exists
psql $DATABASE_URL -c "\d users"
```

### Step 4: Check Prisma Client
```bash
# Generate Prisma client
npm run db:generate

# Validate schema
npx prisma validate
```

### Step 5: Check Server Logs
Look at the terminal where `npm run dev` is running for detailed error messages.

## Setup Checklist

Before testing login/registration, ensure:

- [ ] `.env` file exists with DATABASE_URL
- [ ] PostgreSQL is running
- [ ] Database `geomatchx` exists
- [ ] PostGIS extension is installed
- [ ] Password column exists in users table
- [ ] Prisma client is generated (`npm run db:generate`)
- [ ] Development server is restarted after .env changes

## Testing Registration

1. **Test with valid data**:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test12345" (8+ characters)
   - Other fields: Optional

2. **Check browser console** for errors
3. **Check server terminal** for detailed errors
4. **Check database** to see if user was created:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

## Testing Login

1. **First register a user** (see above)
2. **Try logging in** with the same credentials
3. **Check browser console** for errors
4. **Check server terminal** for detailed errors

## Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Database connection error" | DATABASE_URL not set or wrong | Set correct DATABASE_URL in .env |
| "Missing required environment variable" | .env file missing | Create .env file with DATABASE_URL |
| "Invalid email or password" | User doesn't exist or wrong password | Register first or check credentials |
| "User with this email already exists" | Email already registered | Use different email or login instead |
| "Password must be at least 8 characters" | Password too short | Use 8+ character password |
| "Invalid email format" | Email format incorrect | Use valid email format |

## Still Having Issues?

1. **Check server logs** - Look for detailed error messages
2. **Check browser console** - Look for network errors
3. **Verify database connection** - Test with psql
4. **Check Prisma schema** - Ensure it matches database
5. **Restart dev server** - After making changes

## Getting Help

If issues persist:
1. Check the error message in browser console
2. Check the error message in server terminal
3. Verify DATABASE_URL is correct
4. Ensure database is accessible
5. Check that all dependencies are installed

