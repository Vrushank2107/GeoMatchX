# Database Setup Guide

This guide will help you set up the PostgreSQL database with PostGIS extension for GeoMatchX.

## Prerequisites

1. **PostgreSQL** (version 12 or higher)
2. **PostGIS extension** (version 3.0 or higher)
3. **Node.js** and npm installed
4. **psql** command-line tool (usually comes with PostgreSQL)

## Installation Steps

### 1. Install PostgreSQL and PostGIS

#### macOS (using Homebrew)
```bash
brew install postgresql postgis
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis
sudo systemctl start postgresql
```

#### Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)
Then install PostGIS using Stack Builder or download from [PostGIS website](https://postgis.net/install/)

### 2. Create Database

Connect to PostgreSQL and create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE geomatchx;

# Connect to the new database
\c geomatchx

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

# Exit
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/geomatchx"
```

Replace:
- `postgres` with your PostgreSQL username
- `your_password` with your PostgreSQL password
- `localhost:5432` with your PostgreSQL host and port if different
- `geomatchx` with your database name if different

### 4. Run Database Setup Script

You can use either the Node.js script (cross-platform) or the bash script (Unix/Linux/macOS):

**Option 1: Using Node.js script (Recommended)**
```bash
npm run db:setup
```

**Option 2: Using Bash script (Unix/Linux/macOS)**
```bash
npm run db:setup:sh
# Or directly:
bash scripts/setup-database.sh
```

The script will:
- Verify database connection
- Load the database schema from `geomatchx.sql`
- Create all tables, sequences, and constraints
- Insert sample data
- Verify PostGIS extension
- Check that all tables exist

### 5. Generate Prisma Client

After the database is set up, generate the Prisma client:

```bash
npm run db:generate
```

### 6. Verify Setup

You can verify the setup by:

1. **Using Prisma Studio** (visual database browser):
   ```bash
   npm run db:studio
   ```

2. **Using psql**:
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM sme_jobs;"
   psql $DATABASE_URL -c "SELECT PostGIS_version();"
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   Then visit:
   - http://localhost:3000/api/workers - Should return worker data
   - http://localhost:3000/api/search - Should return search results

## Database Schema

The database includes the following tables:

- **users** - User accounts (SMEs and Workers)
- **user_locations** - Geographic locations with PostGIS geometry
- **skills** - Available skills catalog
- **user_skills** - Skills associated with users
- **sme_jobs** - Job postings by SMEs
- **job_skills** - Skills required for jobs
- **matches** - Worker-job matches with scores

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check PostgreSQL is running**:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify DATABASE_URL format**:
   ```
   postgresql://username:password@host:port/database
   ```

3. **Test connection manually**:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

### PostGIS Issues

If PostGIS is not found:

1. **Install PostGIS** (see installation steps above)

2. **Manually enable extension**:
   ```bash
   psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

3. **Verify installation**:
   ```bash
   psql $DATABASE_URL -c "SELECT PostGIS_version();"
   ```

### Permission Issues

If you get permission errors:

1. **Grant permissions to your user**:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE geomatchx TO your_username;
   \c geomatchx
   GRANT ALL ON SCHEMA public TO your_username;
   ```

2. **Or use superuser** (not recommended for production):
   ```sql
   ALTER USER your_username WITH SUPERUSER;
   ```

### SQL File Issues

If the SQL file fails to load:

1. **Check file encoding** (should be UTF-8)

2. **Load manually**:
   ```bash
   psql $DATABASE_URL < geomatchx.sql
   ```

3. **Check for errors**:
   ```bash
   psql $DATABASE_URL < geomatchx.sql 2>&1 | grep -i error
   ```

## Manual Setup (Alternative)

If the automated script doesn't work, you can set up manually:

1. **Create database and extension**:
   ```sql
   CREATE DATABASE geomatchx;
   \c geomatchx
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Load SQL file**:
   ```bash
   psql $DATABASE_URL < geomatchx.sql
   ```

3. **Verify**:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM sme_jobs;
   ```

## Production Setup

For production environments:

1. Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
2. Ensure PostGIS extension is available
3. Set up proper connection pooling
4. Use environment-specific DATABASE_URL
5. Enable SSL connections
6. Set up database backups

## Next Steps

After database setup:

1. ✅ Database is configured and populated
2. ✅ Prisma client is generated
3. ✅ API routes are ready to use
4. 🚀 Start developing: `npm run dev`

## Support

If you encounter issues:

1. Check the error messages in the console
2. Verify all prerequisites are installed
3. Ensure DATABASE_URL is correct
4. Check PostgreSQL logs for detailed errors

