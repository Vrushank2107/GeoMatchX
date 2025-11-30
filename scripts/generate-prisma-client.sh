#!/bin/bash

# Generate Prisma Client even without DATABASE_URL
# This script temporarily sets a dummy DATABASE_URL for generation

set -e

echo "Generating Prisma Client..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set. Using temporary URL for client generation..."
    export DATABASE_URL="postgresql://user:password@localhost:5432/temp"
fi

# Generate Prisma client
npx prisma generate

echo "✓ Prisma Client generated successfully!"
echo ""
echo "Note: You still need to set DATABASE_URL in .env for the app to work."
echo "The client generation only needs a valid URL format, not an actual connection."

