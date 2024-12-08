const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'lokahi.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS condition_prevalence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    condition TEXT NOT NULL,
    count INTEGER NOT NULL,
    prevalence_percentage REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS demographic_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gender TEXT NOT NULL,
    race TEXT NOT NULL,
    ethnicity TEXT NOT NULL,
    state TEXT NOT NULL,
    condition TEXT NOT NULL,
    count INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS monthly_cost_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total_cost REAL NOT NULL,
    avg_cost_per_service REAL NOT NULL,
    unique_members INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS service_setting_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_type TEXT NOT NULL,
    total_count INTEGER NOT NULL,
    avg_cost REAL NOT NULL,
    unique_members INTEGER NOT NULL
  );
`);

module.exports = db; 