#!/usr/bin/env node

/**
 * Database setup script for GeoMatchX
 * This script sets up the PostgreSQL database with PostGIS extension
 * 
 * Usage: node scripts/setup-db.js
 * 
 * Make sure DATABASE_URL is set in your .env file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env file');
  process.exit(1);
}

// Extract database name from DATABASE_URL
const dbMatch = DATABASE_URL.match(/\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
if (!dbMatch) {
  console.error('Error: Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, dbName] = dbMatch;
const postgresUrl = `postgresql://${user}:${password}@${host}/postgres`;

console.log('Setting up GeoMatchX database...');
console.log(`Database: ${dbName}`);

try {
  // Check if database exists, create if not
  try {
    execSync(`psql "${DATABASE_URL}" -c "SELECT 1"`, { stdio: 'ignore' });
    console.log('Database already exists');
  } catch (error) {
    console.log('Creating database...');
    try {
      execSync(`psql "${postgresUrl}" -c "CREATE DATABASE ${dbName};"`, { stdio: 'inherit' });
    } catch (createError) {
      console.log('Database might already exist or connection failed');
    }
  }

  // Run the SQL file
  const sqlFile = path.join(__dirname, '..', 'geomatchx.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`Error: SQL file not found at ${sqlFile}`);
    process.exit(1);
  }

  console.log('Running geomatchx.sql...');
  execSync(`psql "${DATABASE_URL}" -f "${sqlFile}"`, { stdio: 'inherit' });

  console.log('Database setup complete!');
  console.log('Next steps:');
  console.log('  1. Run: npm run db:generate');
  console.log('  2. Start your development server: npm run dev');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
}

