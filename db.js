'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'budget.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const DEFAULT_CATEGORIES = [
  ['eating-out', 'Eating Out', 'food'],
  ['groceries', 'Groceries', 'cart'],
  ['grooming', 'Haircut & Grooming', 'scissors'],
  ['transport', 'Transport', 'bus'],
  ['entertainment', 'Entertainment', 'gamepad'],
  ['subscriptions', 'Subscriptions', 'repeat'],
  ['health', 'Health', 'heart'],
  ['shopping', 'Shopping', 'bag'],
  ['other', 'Other', 'dots'],
];

const DEFAULT_SETTINGS = { name: '', country: '', budget: 0 };

// Schema changes go in a new entry here; PRAGMA user_version records how many have run.
const MIGRATIONS = [
  () => {
    db.exec(`
      CREATE TABLE settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL            -- JSON-encoded
      );

      CREATE TABLE categories (
        id       TEXT PRIMARY KEY,
        name     TEXT NOT NULL,
        icon     TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE expenses (
        id          TEXT PRIMARY KEY,
        amount      INTEGER NOT NULL CHECK (amount > 0),   -- minor units (cents)
        category_id TEXT NOT NULL REFERENCES categories(id),
        note        TEXT NOT NULL DEFAULT '',
        date        TEXT NOT NULL,                         -- YYYY-MM-DD, local to the user
        time        TEXT NOT NULL DEFAULT '',              -- HH:MM or empty
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE INDEX expenses_by_date ON expenses(date);
      CREATE INDEX expenses_by_category ON expenses(category_id);
    `);
    const addCategory = db.prepare('INSERT INTO categories (id, name, icon, position) VALUES (?, ?, ?, ?)');
    DEFAULT_CATEGORIES.forEach(([id, name, icon], i) => addCategory.run(id, name, icon, i));
    const addSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    Object.entries(DEFAULT_SETTINGS).forEach(([k, v]) => addSetting.run(k, JSON.stringify(v)));
  },
];

db.transaction(() => {
  const version = db.pragma('user_version', { simple: true });
  MIGRATIONS.slice(version).forEach(run => run());
  db.pragma(`user_version = ${MIGRATIONS.length}`);
})();

const q = {
  settings: db.prepare('SELECT key, value FROM settings'),
  categories: db.prepare('SELECT id, name, icon FROM categories ORDER BY position, rowid'),
  expenses: db.prepare('SELECT id, amount, category_id AS categoryId, note, date, time FROM expenses ORDER BY date, time'),
  setSetting: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
  upsertCategory: db.prepare(`
    INSERT INTO categories (id, name, icon, position) VALUES (@id, @name, @icon, @position)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, icon = excluded.icon, position = excluded.position`),
  moveExpenses: db.prepare('UPDATE expenses SET category_id = ?, updated_at = strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\') WHERE category_id = ?'),
  deleteCategory: db.prepare('DELETE FROM categories WHERE id = ?'),
  upsertExpense: db.prepare(`
    INSERT INTO expenses (id, amount, category_id, note, date, time)
    VALUES (@id, @amount, @categoryId, @note, @date, @time)
    ON CONFLICT(id) DO UPDATE SET
      amount = excluded.amount, category_id = excluded.category_id, note = excluded.note,
      date = excluded.date, time = excluded.time,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`),
  deleteExpense: db.prepare('DELETE FROM expenses WHERE id = ?'),
};

function getState() {
  const settings = { ...DEFAULT_SETTINGS };
  q.settings.all().forEach(r => { settings[r.key] = JSON.parse(r.value); });
  return { ...settings, categories: q.categories.all(), expenses: q.expenses.all() };
}

const updateSettings = db.transaction(patch => {
  Object.entries(patch).forEach(([k, v]) => q.setSetting.run(k, JSON.stringify(v)));
});

function upsertCategory(category) {
  q.upsertCategory.run(category);
}

// Expenses must move somewhere first; the foreign key refuses to orphan them.
const deleteCategory = db.transaction((id, moveTo) => {
  if (moveTo) q.moveExpenses.run(moveTo, id);
  q.deleteCategory.run(id);
});

function upsertExpense(expense) {
  q.upsertExpense.run(expense);
}

function deleteExpense(id) {
  q.deleteExpense.run(id);
}

// Used by restore, sample data and erase: swaps the whole dataset atomically.
const replaceAll = db.transaction(({ categories, expenses, ...settings }) => {
  db.exec('DELETE FROM expenses; DELETE FROM categories;');
  categories.forEach((c, position) => q.upsertCategory.run({ ...c, position }));
  expenses.forEach(e => q.upsertExpense.run(e));
  updateSettings(settings);
});

module.exports = { db, DATA_DIR, getState, updateSettings, upsertCategory, deleteCategory, upsertExpense, deleteExpense, replaceAll };
