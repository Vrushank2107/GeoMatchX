# Quick Start: Authentication

## Setup Steps

1. **Update Database Schema**
   ```bash
   # If you have an existing database, add the password column
   npm run db:push
   
   # Or use the SQL script
   psql $DATABASE_URL < scripts/add-password-column.sql
   ```

2. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

## Test Authentication

### Register a Worker
1. Go to http://localhost:3000/auth/register-worker
2. Fill in the form:
   - Name: "Test Worker"
   - Email: "worker@test.com"
   - Password: "test123"
   - Skill Focus: "Electrician"
   - City: "Delhi"
3. Click "Submit profile"
4. You'll be redirected to `/workers` and logged in

### Register an SME
1. Go to http://localhost:3000/auth/register-sme
2. Fill in the form:
   - Company Name: "Test Company"
   - Email: "sme@test.com"
   - Password: "test123"
   - HQ City: "Mumbai"
3. Click "Request access"
4. You'll be redirected to `/post-job` and logged in

### Login
1. Go to http://localhost:3000/auth/login
2. Enter the email and password you used during registration
3. Click "Login"
4. You'll be redirected based on your user type

## API Testing

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"worker@test.com","password":"test123"}' \
  -c cookies.txt
```

### Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- Sessions are stored in HTTP-only cookies (7 day expiry)
- Existing users in the database won't have passwords - they need to register
- User types: `WORKER` or `SME`
- After login/registration, users are automatically redirected based on their type

