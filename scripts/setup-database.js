#!/usr/bin/env node

/**
 * Database Setup Script for GeoMatchX
 * Alternative Node.js version for cross-platform compatibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  log('GeoMatchX Database Setup', 'green');
  log('================================', 'green');
  console.log('');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log('Error: DATABASE_URL environment variable is not set', 'red');
    log('Please set it in your .env file or export it:', 'yellow');
    log("  export DATABASE_URL='postgresql://user:password@localhost:5432/geomatchx'", 'yellow');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  log(`Using database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`, 'yellow');
  console.log('');

  // Check if psql is available
  if (!checkCommand('psql')) {
    log('Error: psql command not found', 'red');
    log('Please install PostgreSQL client tools', 'yellow');
    process.exit(1);
  }

  // Check database connection
  log('Checking database connection...', 'yellow');
  try {
    execSync(`psql "${dbUrl}" -c '\\q'`, { stdio: 'ignore' });
    log('✓ Database connection successful', 'green');
  } catch (error) {
    log('✗ Cannot connect to database', 'red');
    log('Please ensure:', 'yellow');
    log('  1. PostgreSQL is running', 'yellow');
    log('  2. Database exists', 'yellow');
    log('  3. User has proper permissions', 'yellow');
    log('  4. DATABASE_URL is correct', 'yellow');
    process.exit(1);
  }

  // Load SQL file
  const sqlFile = path.join(__dirname, '..', 'geomatchx.sql');
  if (!fs.existsSync(sqlFile)) {
    log(`Error: SQL file not found at ${sqlFile}`, 'red');
    process.exit(1);
  }

  console.log('');
  log('Loading database schema and data from geomatchx.sql...', 'yellow');

  try {
    // Read and execute SQL file
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Filter out pg_dump specific commands that might cause issues
    const cleanedSql = sql
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('\\restrict') &&
               !trimmed.startsWith('\\unrestrict') &&
               !trimmed.startsWith('-- TOC entry') &&
               !trimmed.startsWith('-- Dependencies:') &&
               !trimmed.startsWith('-- Name:') &&
               !trimmed.startsWith('-- Owner:') &&
               trimmed !== '';
      })
      .join('\n');

    // Execute SQL
    execSync(`psql "${dbUrl}"`, {
      input: cleanedSql,
      stdio: 'inherit'
    });
    
    log('✓ Database schema loaded successfully', 'green');
  } catch (error) {
    // Check if database is actually set up
    try {
      execSync(`psql "${dbUrl}" -c "SELECT COUNT(*) FROM users;"`, { stdio: 'ignore' });
      log('✓ Database appears to be set up (some objects may already exist)', 'green');
    } catch {
      log('✗ Database setup failed', 'red');
      process.exit(1);
    }
  }

  console.log('');
  log('Verifying database setup...', 'yellow');

  // Verify tables
  const tables = ['users', 'user_locations', 'skills', 'user_skills', 'sme_jobs', 'job_skills', 'matches'];
  let allExist = true;

  for (const table of tables) {
    try {
      execSync(`psql "${dbUrl}" -c "\\d ${table}"`, { stdio: 'ignore' });
      log(`✓ Table '${table}' exists`, 'green');
    } catch {
      log(`✗ Table '${table}' not found`, 'red');
      allExist = false;
    }
  }

  // Check PostGIS
  try {
    execSync(`psql "${dbUrl}" -c "SELECT PostGIS_version();"`, { stdio: 'ignore' });
    log('✓ PostGIS extension is installed', 'green');
  } catch {
    log('⚠ PostGIS extension not found. Installing...', 'yellow');
    try {
      execSync(`psql "${dbUrl}" -c "CREATE EXTENSION IF NOT EXISTS postgis;"`, { stdio: 'ignore' });
      log('✓ PostGIS extension installed', 'green');
    } catch (error) {
      log('✗ Failed to install PostGIS extension', 'red');
      log('Please install PostGIS on your PostgreSQL server', 'yellow');
      process.exit(1);
    }
  }

  // Check data
  try {
    const userCount = execSync(`psql "${dbUrl}" -t -c "SELECT COUNT(*) FROM users;"`, { encoding: 'utf8' }).trim();
    if (parseInt(userCount) > 0) {
      log(`✓ Found ${userCount} users in database`, 'green');
    } else {
      log('⚠ No users found in database (this is okay if you\'re starting fresh)', 'yellow');
    }
  } catch {
    // Ignore
  }

  console.log('');
  if (allExist) {
    log('================================', 'green');
    log('Database setup completed successfully!', 'green');
    log('================================', 'green');
    console.log('');
    log('Next steps:', 'yellow');
    log('  1. Run \'npm run db:generate\' to generate Prisma client', 'yellow');
    log('  2. Run \'npm run dev\' to start the development server', 'yellow');
  } else {
    log('================================', 'red');
    log('Database setup completed with errors', 'red');
    log('Please check the output above', 'red');
    log('================================', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});

