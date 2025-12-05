import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'geomatchx.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Enable WAL mode for better concurrency
    initializeSchema();
  }
  return db;
}

// Initialize database schema
function initializeSchema() {
  const database = db!;
  
  // Enable foreign keys
  database.pragma('foreign_keys = ON');

  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      user_type TEXT NOT NULL CHECK(user_type IN ('SME', 'CANDIDATE')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      bio TEXT
    )
  `);

  // Backfill bio column for existing databases (ignore error if it already exists)
  try {
    database.exec(`ALTER TABLE users ADD COLUMN bio TEXT`);
  } catch (error) {
    if (error instanceof Error && !error.message.includes('duplicate column name')) {
      console.error('[db] Failed to add bio column to users table:', error);
    }
  }

  // Create user_locations table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_locations (
      location_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      address TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create skills table
  database.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT UNIQUE NOT NULL
    )
  `);

  // Create user_skills table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_skills (
      user_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      experience_years INTEGER,
      PRIMARY KEY (user_id, skill_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    )
  `);

  // Create sme_jobs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sme_jobs (
      job_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sme_id INTEGER NOT NULL,
      job_title TEXT,
      job_description TEXT,
      salary REAL,
      status TEXT DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sme_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create job_skills table
  database.exec(`
    CREATE TABLE IF NOT EXISTS job_skills (
      job_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      PRIMARY KEY (job_id, skill_id),
      FOREIGN KEY (job_id) REFERENCES sme_jobs(job_id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    )
  `);

  // Create matches table
  database.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      worker_id INTEGER,
      distance_km REAL,
      score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES sme_jobs(job_id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create job_applications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      application_id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
      cover_letter TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES sme_jobs(job_id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(job_id, worker_id)
    )
  `);

  // Create notifications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('JOB_MATCH', 'APPLICATION_UPDATE', 'MESSAGE', 'SYSTEM', 'RECRUITMENT_REQUEST')),
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // Create recruitment_requests table
  database.exec(`
    CREATE TABLE IF NOT EXISTS recruitment_requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sme_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sme_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(sme_id, worker_id)
    )
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_sme_jobs_sme_id ON sme_jobs(sme_id);
    CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
    CREATE INDEX IF NOT EXISTS idx_matches_worker_id ON matches(worker_id);
    CREATE INDEX IF NOT EXISTS idx_matches_job_id ON matches(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_worker_id ON job_applications(worker_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    CREATE INDEX IF NOT EXISTS idx_recruitment_requests_worker_id ON recruitment_requests(worker_id);
    CREATE INDEX IF NOT EXISTS idx_recruitment_requests_sme_id ON recruitment_requests(sme_id);
  `);
}

// Export database instance
export const database = getDb();

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('[db] Connection test failed:', error);
    return false;
  }
}

// Helper to calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to get coordinates from a location_id
export function getLocationCoordinates(locationId: number): { longitude: number; latitude: number } | null {
  try {
    const db = getDb();
    const location = db.prepare(`
      SELECT longitude, latitude
      FROM user_locations
      WHERE location_id = ?
    `).get(locationId) as { longitude: number; latitude: number } | undefined;
    
    return location || null;
  } catch (error) {
    console.error('[db] Error getting coordinates:', error);
    return null;
  }
}

// Helper to find locations within radius
export function findLocationsWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number
) {
  try {
    const db = getDb();
    const locations = db.prepare(`
    SELECT 
      location_id,
      user_id,
      address,
        longitude,
        latitude,
        (6371 * acos(
          cos(radians(?)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * 
          sin(radians(latitude))
        )) as distance_km
    FROM user_locations
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance_km <= ?
    ORDER BY distance_km
    `).all(centerLat, centerLon, centerLat, radiusKm) as Array<{
      location_id: number;
      user_id: number;
      address: string | null;
      longitude: number;
      latitude: number;
      distance_km: number;
    }>;
    
    return locations;
  } catch (error) {
    console.error('[db] Error finding locations within radius:', error);
    return [];
  }
}

// Database query helper (for compatibility with existing code)
export async function queryDb<T>(query: string, ...params: unknown[]): Promise<T[]> {
  try {
    const db = getDb();
    // Convert PostgreSQL-style $1, $2 parameters to SQLite ? placeholders
    let sqliteQuery = query;
    const sqliteParams: unknown[] = [];
    
    // Simple parameter replacement (for basic cases)
    let paramIndex = 1;
    for (const param of params) {
      sqliteQuery = sqliteQuery.replace(`$${paramIndex}`, '?');
      sqliteParams.push(param);
      paramIndex++;
    }
    
    // Remove PostGIS-specific functions and replace with SQLite equivalents
    sqliteQuery = sqliteQuery.replace(/ST_SetSRID\(ST_MakePoint\(([^,]+),\s*([^)]+)\),\s*4326\)::geography/gi, 
      (match, lon, lat) => {
        // For SQLite, we'll just store lat/lng separately
        return `${lat}, ${lon}`;
      });
    
    const stmt = db.prepare(sqliteQuery);
    const result = stmt.all(...sqliteParams) as T[];
    return result;
  } catch (error) {
    console.error('[db] Query error:', error);
    throw error;
  }
}

// Type definitions for database models
export interface User {
  user_id: number;
  name: string;
  email: string;
  password: string | null;
  phone: string | null;
  user_type: 'SME' | 'CANDIDATE';
  created_at: string;
  bio: string | null;
}

export interface UserLocation {
  location_id: number;
  user_id: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Skill {
  skill_id: number;
  skill_name: string;
}

export interface UserSkill {
  user_id: number;
  skill_id: number;
  experience_years: number | null;
}

export interface SmeJob {
  job_id: number;
  sme_id: number;
  job_title: string | null;
  job_description: string | null;
  salary: number | null;
  status: string;
  created_at: string;
}

export interface JobSkill {
  job_id: number;
  skill_id: number;
}

export interface Match {
  match_id: number;
  job_id: number | null;
  candidate_id: number | null;
  distance_km: number | null;
  score: number | null;
  created_at: string;
}

export interface JobApplication {
  application_id: number;
  job_id: number;
  candidate_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: 'JOB_MATCH' | 'APPLICATION_UPDATE' | 'MESSAGE' | 'SYSTEM';
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}
