#!/usr/bin/env node

/**
 * Post-generation fix for Prisma 7
 * Creates JavaScript compatibility files for CommonJS require()
 */

const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');

console.log('Creating Prisma Client JavaScript compatibility files...\n');

// Create default.js - use lazy getter to allow Next.js/Turbopack to handle TypeScript
const defaultJs = `// Prisma 7 compatibility - exports PrismaClient for CommonJS
// This uses lazy getters so Next.js/Turbopack can handle TypeScript imports at runtime

Object.defineProperty(module.exports, 'PrismaClient', {
  get() {
    try {
      // Next.js/Turbopack will transpile and handle this TypeScript import
      const client = require('./client');
      return client.PrismaClient;
    } catch (e) {
      // Fallback: try from @prisma/client package
      try {
        return require('@prisma/client').PrismaClient;
      } catch (e2) {
        throw new Error('PrismaClient not found. Run: npm run db:generate && restart dev server');
      }
    }
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(module.exports, 'default', {
  get() {
    return module.exports.PrismaClient;
  },
  enumerable: true,
  configurable: true
});
`;

// Create index.js
const indexJs = `// Prisma 7 compatibility - main entry point
const { PrismaClient } = require('./client');
module.exports = { PrismaClient };
`;

try {
  if (!fs.existsSync(clientDir)) {
    console.error('✗ Prisma Client directory not found. Run "npm run db:generate" first.');
    process.exit(1);
  }

  // Write default.js
  fs.writeFileSync(path.join(clientDir, 'default.js'), defaultJs);
  console.log('✓ Created default.js');

  // Write index.js
  fs.writeFileSync(path.join(clientDir, 'index.js'), indexJs);
  console.log('✓ Created index.js');

  console.log('\n✅ Prisma Client JavaScript files created successfully!');
  console.log('\n⚠️  IMPORTANT: Restart your dev server now!');
  console.log('   Run: npm run dev\n');
} catch (error) {
  console.error('✗ Failed to create JavaScript files:', error.message);
  process.exit(1);
}

