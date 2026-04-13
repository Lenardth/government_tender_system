/**
 * db.js — SQLite database (no server required).
 * Database file is stored at ./database/tender_system.db
 * Falls back gracefully if MySQL env vars are set but unavailable.
 */
const path    = require('path');
const fs      = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../../database/tender_system.db');

// Ensure the database directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Bootstrap schema on first run ────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'contractor'
                       CHECK(role IN ('contractor','investor','government','admin')),
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    DEFAULT (datetime('now')),
    updated_at TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tenders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT,
    category    TEXT    NOT NULL
                        CHECK(category IN ('construction','it','healthcare','energy','education','transport','other')),
    budget      REAL    NOT NULL,
    deadline    TEXT    NOT NULL,
    location    TEXT,
    province    TEXT,
    status      TEXT    NOT NULL DEFAULT 'open'
                        CHECK(status IN ('open','closed','awarded','cancelled')),
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    tender_id    INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    proposal     TEXT,
    bid_amount   REAL,
    status       TEXT    NOT NULL DEFAULT 'pending'
                         CHECK(status IN ('pending','reviewed','accepted','rejected')),
    submitted_at TEXT    DEFAULT (datetime('now')),
    UNIQUE(tender_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action     TEXT    NOT NULL,
    entity     TEXT,
    entity_id  INTEGER,
    details    TEXT,
    ip_address TEXT,
    created_at TEXT    DEFAULT (datetime('now'))
  );
`);

// ── Seed sample tenders if empty ─────────────────────────────
const tenderCount = db.prepare('SELECT COUNT(*) as n FROM tenders').get().n;
if (tenderCount === 0) {
  const insert = db.prepare(`
    INSERT INTO tenders (title, description, category, budget, deadline, location, province, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
  `);
  const seedMany = db.transaction(rows => rows.forEach(r => insert.run(...r)));
  seedMany([
    ['Cape Town Road Infrastructure',  'Development of road infrastructure in Cape Town metropolitan area.',       'construction', 25000000, '2025-09-30', 'Cape Town',    'Western Cape'],
    ['Durban Port Expansion',           'Expansion of Durban port facilities to increase cargo handling capacity.', 'construction', 50000000, '2025-10-15', 'Durban',       'KwaZulu-Natal'],
    ['Johannesburg Solar Initiative',   'Installation of solar panels on government buildings in Johannesburg.',    'energy',       15000000, '2025-08-10', 'Johannesburg', 'Gauteng'],
    ['National Healthcare Database',    'Development of a centralised healthcare database for public hospitals.',   'it',           12000000, '2025-07-20', 'Pretoria',     'Gauteng'],
    ['East London Hospital Renovation', 'Comprehensive renovation of East London General Hospital.',                'healthcare',   30000000, '2025-11-01', 'East London',  'Eastern Cape'],
    ['Pretoria Public Transport System','Upgrade of public transport infrastructure in Pretoria.',                  'transport',    40000000, '2025-12-15', 'Pretoria',     'Gauteng'],
  ]);
  console.log('db: seeded 6 sample tenders');
}

console.log(`db: SQLite ready → ${DB_PATH}`);

/**
 * Promisified query helper — mirrors the mysql2 pool.query() API
 * so existing route files work without changes.
 *
 * Usage:
 *   const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [1]);
 */
db.query = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = this.prepare(sql);
      const upper = sql.trim().toUpperCase();
      if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA')) {
        resolve([stmt.all(...params), null]);
      } else {
        const info = stmt.run(...params);
        // Mimic mysql2: result has insertId and affectedRows
        resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }, null]);
      }
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = db;
