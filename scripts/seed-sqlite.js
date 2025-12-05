/*
  Simple SQLite seed script for GeoMatchX.
  Usage:
    npm run seed

  Notes:
  - Uses the same DATABASE_PATH / data/geomatchx.db convention as src/lib/db.ts.
  - Assumes the app has been run at least once so tables already exist.
*/

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "geomatchx.db");
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

function ensureUser(email, name, userType) {
  const existing = db.prepare("SELECT user_id FROM users WHERE email = ?").get(email);
  if (existing) return existing.user_id;

  const result = db
    .prepare(
      "INSERT INTO users (name, email, user_type, password, phone) VALUES (?, ?, ?, NULL, NULL)"
    )
    .run(name, email, userType);
  return result.lastInsertRowid;
}

function ensureLocation(userId, city) {
  const existing = db
    .prepare("SELECT location_id FROM user_locations WHERE user_id = ? LIMIT 1")
    .get(userId);
  if (existing) return existing.location_id;

  const result = db
    .prepare(
      "INSERT INTO user_locations (user_id, address, latitude, longitude) VALUES (?, ?, NULL, NULL)"
    )
    .run(userId, city);
  return result.lastInsertRowid;
}

function ensureSkill(name) {
  const existing = db
    .prepare("SELECT skill_id FROM skills WHERE LOWER(skill_name) = LOWER(?)")
    .get(name);
  if (existing) return existing.skill_id;

  const result = db.prepare("INSERT INTO skills (skill_name) VALUES (?)").run(name);
  return result.lastInsertRowid;
}

function linkUserSkill(userId, skillName, experienceYears) {
  const skillId = ensureSkill(skillName);
  const existing = db
    .prepare("SELECT 1 FROM user_skills WHERE user_id = ? AND skill_id = ?")
    .get(userId, skillId);
  if (existing) return;

  db.prepare(
    "INSERT INTO user_skills (user_id, skill_id, experience_years) VALUES (?, ?, ?)"
  ).run(userId, skillId, experienceYears);
}

function seed() {
  console.log("Seeding GeoMatchX SQLite database at", dbPath);

  // SMEs
  const smeSunpulse = ensureUser("ops@sunpulse.example", "SunPulse Energy", "SME");
  ensureLocation(smeSunpulse, "Nairobi");

  const smeOrigin = ensureUser("talent@origin-retreats.example", "Origin Retreats", "SME");
  ensureLocation(smeOrigin, "Cape Town");

  // Workers
  const workerAmina = ensureUser("amina@workers.example", "Amina Yusuf", "CANDIDATE");
  ensureLocation(workerAmina, "Nairobi");
  linkUserSkill(workerAmina, "Electrical", 6);
  linkUserSkill(workerAmina, "Construction", 6);

  const workerKwame = ensureUser("kwame@workers.example", "Kwame Boateng", "CANDIDATE");
  ensureLocation(workerKwame, "Accra");
  linkUserSkill(workerKwame, "Construction", 9);
  linkUserSkill(workerKwame, "Logistics", 9);

  const workerLindiwe = ensureUser("lindiwe@workers.example", "Lindiwe Ndlovu", "CANDIDATE");
  ensureLocation(workerLindiwe, "Johannesburg");
  linkUserSkill(workerLindiwe, "Hospitality", 8);
  linkUserSkill(workerLindiwe, "Catering", 8);

  // Jobs
  const existingJobs = db.prepare("SELECT COUNT(*) as count FROM sme_jobs").get();
  if (!existingJobs || !existingJobs.count) {
    const job1 = db
      .prepare(
        "INSERT INTO sme_jobs (sme_id, job_title, job_description, salary, status) VALUES (?, ?, ?, ?, 'OPEN')"
      )
      .run(
        smeSunpulse,
        "Mini-grid rollout technician",
        "Deploy modular solar kits across northern Kenya with rapid QA cycles.",
        12000,
      ).lastInsertRowid;

    linkJobSkill(job1, "Electrical");
    linkJobSkill(job1, "Construction");

    const job2 = db
      .prepare(
        "INSERT INTO sme_jobs (sme_id, job_title, job_description, salary, status) VALUES (?, ?, ?, ?, 'OPEN')"
      )
      .run(
        smeOrigin,
        "Hospitality launch crew",
        "Lead service blueprinting for a boutique eco-lodge experience.",
        8000,
      ).lastInsertRowid;

    linkJobSkill(job2, "Hospitality");
    linkJobSkill(job2, "Catering");
  }

  console.log("Seed complete.");
}

function linkJobSkill(jobId, skillName) {
  const skillId = ensureSkill(skillName);
  const existing = db
    .prepare("SELECT 1 FROM job_skills WHERE job_id = ? AND skill_id = ?")
    .get(jobId, skillId);
  if (existing) return;

  db.prepare("INSERT INTO job_skills (job_id, skill_id) VALUES (?, ?)").run(jobId, skillId);
}

seed();