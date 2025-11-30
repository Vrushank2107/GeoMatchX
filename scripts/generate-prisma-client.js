#!/usr/bin/env node

/**
 * Generate Prisma Client without requiring a real database connection
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating Prisma Client...\n');

// Set temporary DATABASE_URL if not set
const tempDbUrl = 'postgresql://user:password@localhost:5432/temp';
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not set. Using temporary URL for client generation...');
  process.env.DATABASE_URL = tempDbUrl;
}

// Update prisma.config.ts with temp URL if needed
const configPath = path.join(__dirname, '..', 'prisma.config.ts');
try {
  let configContent = fs.readFileSync(configPath, 'utf8');
  if (!configContent.includes('postgresql://user:password@localhost:5432/temp')) {
    configContent = configContent.replace(
      /url:\s*env\("DATABASE_URL"[^)]*\)/,
      `url: env("DATABASE_URL", "${tempDbUrl}")`
    );
    fs.writeFileSync(configPath, configContent);
  }
} catch (err) {
  console.warn('Could not update prisma.config.ts:', err.message);
}

try {
  // Use direct prisma generate with schema file
  execSync('npx prisma generate --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || tempDbUrl,
    },
    cwd: path.join(__dirname, '..'),
  });
  
  // Verify client was generated
  const clientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  if (!fs.existsSync(clientPath)) {
    throw new Error('Prisma Client was not generated. Check the output above for errors.');
  }
  
  console.log('\n✓ Prisma Client generated successfully!');
  
  // Run post-generation fix
  try {
    require('./post-generate-fix.js');
  } catch (fixError) {
    console.warn('\n⚠️  Post-generation fix failed, but client was generated.');
    console.warn('   You may need to restart the dev server manually.');
  }
  
  console.log('\nNote: You still need to set DATABASE_URL in .env for the app to work.');
  console.log('The client generation only needs a valid URL format, not an actual connection.');
} catch (error) {
  console.error('\n✗ Failed to generate Prisma Client');
  console.error('Error:', error.message);
  console.error('\nTrying alternative generation method...');
  
  // Fallback: try without config file
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: tempDbUrl,
      },
      cwd: path.join(__dirname, '..'),
    });
    console.log('\n✓ Prisma Client generated successfully (fallback method)!');
  } catch (fallbackError) {
    console.error('\n✗ Both generation methods failed');
    console.error('Make sure Prisma is installed: npm install');
    console.error('Check your prisma.config.ts and schema.prisma files');
    process.exit(1);
  }
}

