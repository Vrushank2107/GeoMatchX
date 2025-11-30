#!/bin/bash

# Database Setup Script for GeoMatchX
# This script sets up the PostgreSQL database with PostGIS extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}GeoMatchX Database Setup${NC}"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/geomatchx'"
    exit 1
fi

echo -e "${YELLOW}Using database: ${DATABASE_URL}${NC}"
echo ""

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' || echo "5432")

echo -e "${YELLOW}Database Details:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Check if database exists and is accessible
echo -e "${YELLOW}Checking database connection...${NC}"
if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    echo "Please ensure:"
    echo "  1. PostgreSQL is running"
    echo "  2. Database exists"
    echo "  3. User has proper permissions"
    echo "  4. DATABASE_URL is correct"
    exit 1
fi

# Load the SQL file
SQL_FILE="$(dirname "$0")/../geomatchx.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file not found at $SQL_FILE${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Loading database schema and data from geomatchx.sql...${NC}"

# Remove the restrict/unrestrict lines and execute
# The SQL file has some pg_dump specific commands we need to handle
if psql "$DATABASE_URL" < "$SQL_FILE" 2>&1 | grep -v "restrict\|unrestrict\|TOC entry\|Dependencies\|Owner\|SET\|SELECT pg_catalog"; then
    echo -e "${GREEN}✓ Database schema loaded successfully${NC}"
else
    # Check if it's just warnings about existing objects
    if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database appears to be set up (some objects may already exist)${NC}"
    else
        echo -e "${YELLOW}⚠ Some warnings occurred, but checking if setup was successful...${NC}"
        if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Database setup successful${NC}"
        else
            echo -e "${RED}✗ Database setup failed${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${YELLOW}Verifying database setup...${NC}"

# Verify tables exist
TABLES=("users" "user_locations" "skills" "user_skills" "sme_jobs" "job_skills" "matches")
ALL_EXIST=true

for table in "${TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "\d $table" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Table '$table' exists${NC}"
    else
        echo -e "${RED}✗ Table '$table' not found${NC}"
        ALL_EXIST=false
    fi
done

# Check PostGIS extension
if psql "$DATABASE_URL" -c "SELECT PostGIS_version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostGIS extension is installed${NC}"
else
    echo -e "${YELLOW}⚠ PostGIS extension not found. Installing...${NC}"
    psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS postgis;" || {
        echo -e "${RED}✗ Failed to install PostGIS extension${NC}"
        echo "Please install PostGIS on your PostgreSQL server"
        exit 1
    }
    echo -e "${GREEN}✓ PostGIS extension installed${NC}"
fi

# Check data
USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" | xargs)
if [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $USER_COUNT users in database${NC}"
else
    echo -e "${YELLOW}⚠ No users found in database (this is okay if you're starting fresh)${NC}"
fi

echo ""
if [ "$ALL_EXIST" = true ]; then
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}Database setup completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run db:generate' to generate Prisma client"
    echo "  2. Run 'npm run dev' to start the development server"
else
    echo -e "${RED}================================${NC}"
    echo -e "${RED}Database setup completed with errors${NC}"
    echo -e "${RED}Please check the output above${NC}"
    echo -e "${RED}================================${NC}"
    exit 1
fi

