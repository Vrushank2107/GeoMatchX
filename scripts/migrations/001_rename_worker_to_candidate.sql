-- Migration script to rename worker to candidate in the database
-- This script should be run after the application code has been updated

-- Disable foreign key checks to allow table modifications
PRAGMA foreign_keys = OFF;

-- 1. Rename worker_id to candidate_id in the matches table
ALTER TABLE matches RENAME TO matches_old;

CREATE TABLE IF NOT EXISTS matches (
  match_id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  candidate_id INTEGER,
  distance_km REAL,
  score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES sme_jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO matches (match_id, job_id, candidate_id, distance_km, score, created_at)
SELECT match_id, job_id, worker_id, distance_km, score, created_at
FROM matches_old;

DROP TABLE matches_old;

-- 2. Rename worker_id to candidate_id in the job_applications table
ALTER TABLE job_applications RENAME TO job_applications_old;

CREATE TABLE IF NOT EXISTS job_applications (
  application_id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  cover_letter TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES sme_jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE(job_id, candidate_id)
);

INSERT INTO job_applications (application_id, job_id, candidate_id, status, cover_letter, created_at, updated_at)
SELECT application_id, job_id, worker_id, status, cover_letter, created_at, updated_at
FROM job_applications_old;

DROP TABLE job_applications_old;

-- 3. Rename worker_id to candidate_id in the recruitment_requests table
ALTER TABLE recruitment_requests RENAME TO recruitment_requests_old;

CREATE TABLE IF NOT EXISTS recruitment_requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sme_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sme_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE(sme_id, candidate_id)
);

INSERT INTO recruitment_requests (request_id, sme_id, candidate_id, status, created_at, updated_at)
SELECT request_id, sme_id, worker_id, status, created_at, updated_at
FROM recruitment_requests_old;

DROP TABLE recruitment_requests_old;

-- 4. Recreate indexes with new column names
DROP INDEX IF EXISTS idx_matches_worker_id;
CREATE INDEX IF NOT EXISTS idx_matches_candidate_id ON matches(candidate_id);

DROP INDEX IF EXISTS idx_job_applications_worker_id;
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);

DROP INDEX IF EXISTS idx_recruitment_requests_worker_id;
CREATE INDEX IF NOT EXISTS idx_recruitment_requests_candidate_id ON recruitment_requests(candidate_id);

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;
