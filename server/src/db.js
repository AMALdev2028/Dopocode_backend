const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress (
    student_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 1,
    mastery REAL NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    questions_seen INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (student_id, skill),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    question_id TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    understanding TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS student_stats (
    student_id TEXT PRIMARY KEY,
    total_points INTEGER NOT NULL DEFAULT 0,
    day_streak INTEGER NOT NULL DEFAULT 0,
    longest_day_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS daily_activity (
    student_id TEXT NOT NULL,
    activity_date TEXT NOT NULL,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (student_id, activity_date),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE INDEX IF NOT EXISTS idx_attempts_student_skill
    ON attempts (student_id, skill, created_at);
`);

module.exports = db;
