#!/usr/bin/env node

/**
 * Setup Check Script
 * Verifies that the environment is properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    log('✓ .env file exists', 'green');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('DATABASE_URL')) {
      log('✓ DATABASE_URL found in .env', 'green');
      const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
      if (match && match[1] && !match[1].includes('password') && !match[1].includes('localhost')) {
        log('⚠ DATABASE_URL appears to be configured', 'yellow');
      } else if (match && match[1]) {
        log('✓ DATABASE_URL is set', 'green');
      } else {
        log('✗ DATABASE_URL format may be incorrect', 'red');
      }
    } else {
      log('✗ DATABASE_URL not found in .env', 'red');
      log('  Add: DATABASE_URL="postgresql://user:password@host:port/database"', 'yellow');
    }
  } else {
    log('✗ .env file not found', 'red');
    log('  Create .env file with DATABASE_URL', 'yellow');
  }
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    log('✓ package.json exists', 'green');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = ['@prisma/client', 'prisma', 'bcryptjs', 'pg'];
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );
    
    if (missingDeps.length === 0) {
      log('✓ Required dependencies installed', 'green');
    } else {
      log(`✗ Missing dependencies: ${missingDeps.join(', ')}`, 'red');
      log('  Run: npm install', 'yellow');
    }
  }
}

function checkPrismaSchema() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    log('✓ Prisma schema exists', 'green');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    if (schemaContent.includes('password')) {
      log('✓ Password field found in schema', 'green');
    } else {
      log('✗ Password field not found in schema', 'red');
    }
  } else {
    log('✗ Prisma schema not found', 'red');
  }
}

function checkDatabaseSetup() {
  log('\n📊 Database Setup Status:', 'blue');
  log('To check database connection, run:', 'yellow');
  log('  psql $DATABASE_URL -c "SELECT version();"', 'yellow');
  log('\nTo set up database, run:', 'yellow');
  log('  npm run db:setup', 'yellow');
}

async function main() {
  log('\n🔍 GeoMatchX Setup Check\n', 'blue');
  log('='.repeat(50), 'blue');
  
  log('\n📁 File Checks:', 'blue');
  checkEnvFile();
  checkPackageJson();
  checkPrismaSchema();
  
  checkDatabaseSetup();
  
  log('\n' + '='.repeat(50), 'blue');
  log('\n💡 Next Steps:', 'blue');
  log('1. Ensure .env file has DATABASE_URL', 'yellow');
  log('2. Run: npm run db:generate', 'yellow');
  log('3. Run: npm run db:setup (if database not set up)', 'yellow');
  log('4. Start dev server: npm run dev', 'yellow');
  log('\n');
}

main().catch(error => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});

