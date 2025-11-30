#!/bin/bash

# Database setup script for GeoMatchX
# This script sets up the PostgreSQL database with PostGIS extension

set -e

echo "Setting up GeoMatchX database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://postgres:password@localhost:5432/geomatchx?schema=public'"
    exit 1
fi

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    echo "Error: Could not extract database name from DATABASE_URL"
    exit 1
fi

echo "Database name: $DB_NAME"

# Create database if it doesn't exist (requires connection to postgres database)
echo "Creating database if it doesn't exist..."
psql "$DATABASE_URL" -c "SELECT 1" 2>/dev/null || \
psql "postgresql://$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):\([^@]*\)@\([^\/]*\).*/\1:\2@\3\/postgres/p')" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || \
echo "Database might already exist or connection failed. Continuing..."

# Run the SQL file
echo "Running geomatchx.sql..."
psql "$DATABASE_URL" -f geomatchx.sql

echo "Database setup complete!"
echo "You can now run: npm run db:generate"

