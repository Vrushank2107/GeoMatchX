const { database } = require('../dist/lib/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    // Create migrations table if it doesn't exist
    database.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already executed migrations
    const executedMigrations = database
      .prepare('SELECT name FROM migrations')
      .all()
      .map((row: any) => row.name);

    // Run new migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        // Read the migration file
        const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        // Execute the migration in a transaction
        database.exec('BEGIN TRANSACTION');
        try {
          // Split the migration into individual statements
          const statements = migration
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
          
          // Execute each statement
          for (const statement of statements) {
            database.exec(statement);
          }
          
          // Record the migration
          database
            .prepare('INSERT INTO migrations (name) VALUES (?)')
            .run(file);
            
          database.exec('COMMIT');
          console.log(`✅ Successfully applied migration: ${file}`);
        } catch (error) {
          database.exec('ROLLBACK');
          console.error(`❌ Failed to apply migration ${file}:`, error);
          process.exit(1);
        }
      } else {
        console.log(`✓ Migration already applied: ${file}`);
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
