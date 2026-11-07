'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const store = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/* ================= Passcode ================= */

// BUDGET_PASSCODE wins; otherwise a random code is generated once and kept in data/passcode.txt.
function loadPasscode() {
  if (process.env.BUDGET_PASSCODE) return { code: process.env.BUDGET_PASSCODE, source: 'BUDGET_PASSCODE' };
  const file = path.join(store.DATA_DIR, 'passcode.txt');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomInt(0, 1e8).toString().padStart(8, '0') + '\n', { mode: 0o600 });
  }
  return { code: fs.readFileSync(file, 'utf8').trim(), source: file };
}

const passcode = loadPasscode();
const digest = s => crypto.createHash('sha256').update(String(s)).digest();
const PASS_DIGEST = digest(passcode.code);

const MAX_FAILURES = 10;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map(); // ip -> { count, resetAt }

function requirePasscode(req, res, next) {
  const now = Date.now();
  let entry = failures.get(req.ip);
  if (entry && now > entry.resetAt) { failures.delete(req.ip); entry = null; }
  if (entry && entry.count >= MAX_FAILURES) {
    return res.status(429).json({ error: 'Too many wrong passcodes. Try again in 15 minutes.' });
  }

  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (token && crypto.timingSafeEqual(digest(token), PASS_DIGEST)) {
    failures.delete(req.ip);
    return next();
  }
  if (token) {
    entry ??= { count: 0, resetAt: now + LOCKOUT_MS };
    entry.count++;
    failures.set(req.ip, entry);
  }
  res.status(401).json({ error: token ? 'Wrong passcode' : 'Passcode required' });
}

/* ================= Validation ================= */

class BadRequest extends Error {}

const isInt = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
const isStr = (v, max) => typeof v === 'string' && v.length <= max;

function checkId(id) {
  if (!isStr(id, 64) || !/^[\w-]+$/.test(id)) throw new BadRequest('Invalid id');
  return id;
}

function checkDate(date) {
  if (!isStr(date, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequest('Date must be YYYY-MM-DD');
  const [y, m, d] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d) throw new BadRequest('Invalid date');
  return date;
}

function checkExpense(id, b) {
  if (!b || typeof b !== 'object') throw new BadRequest('Expense body required');
  if (!isInt(b.amount, 1, 1e13)) throw new BadRequest('Amount must be a positive whole number of cents');
  if (!isStr(b.note ?? '', 200)) throw new BadRequest('Note is too long');
  const time = b.time ?? '';
  if (!isStr(time, 5) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new BadRequest('Time must be HH:MM');
  return { id: checkId(id), amount: b.amount, categoryId: checkId(b.categoryId), note: (b.note ?? '').trim(), date: checkDate(b.date), time };
}

function checkCategory(id, b) {
  if (!b || typeof b !== 'object') throw new BadRequest('Category body required');
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name || name.length > 40) throw new BadRequest('Category name must be 1–40 characters');
  if (!isStr(b.icon, 20) || !/^[a-z0-9-]+$/.test(b.icon)) throw new BadRequest('Invalid icon');
  const position = b.position ?? 0;
  if (!isInt(position, 0, 10000)) throw new BadRequest('Invalid position');
  return { id: checkId(id), name, icon: b.icon, position };
}

function checkSettings(b, { partial }) {
  if (!b || typeof b !== 'object') throw new BadRequest('Settings body required');
  const out = {};
  if ('name' in b || !partial) {
    if (!isStr(b.name ?? '', 60)) throw new BadRequest('Name is too long');
    out.name = (b.name ?? '').trim();
  }
  if ('country' in b || !partial) {
    if (!isStr(b.country ?? '', 2) || (b.country && !/^[A-Z]{2}$/.test(b.country))) throw new BadRequest('Country must be a 2-letter code');
    out.country = b.country ?? '';
  }
  if ('budget' in b || !partial) {
    if (!isInt(b.budget ?? 0, 0, 1e13)) throw new BadRequest('Budget must be a whole number of cents');
    out.budget = b.budget ?? 0;
  }
  return out;
}

function checkFullState(b) {
  if (!b || !Array.isArray(b.categories) || !Array.isArray(b.expenses)) throw new BadRequest('categories and expenses arrays required');
  if (!b.categories.length) throw new BadRequest('At least one category is required');
  if (b.categories.length > 500 || b.expenses.length > 200000) throw new BadRequest('Too many records');
  return {
    ...checkSettings(b, { partial: false }),
    categories: b.categories.map(c => {
      const { id, name, icon } = checkCategory(c?.id, c);
      return { id, name, icon };
    }),
    expenses: b.expenses.map(e => checkExpense(e?.id, e)),
  };
}

/* ================= App ================= */

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'budget-tracker' }));

app.use('/api', requirePasscode);

app.get('/api/state', (req, res) => {
  res.json(store.getState());
});

app.put('/api/state', (req, res) => {
  store.replaceAll(checkFullState(req.body));
  res.status(204).end();
});

app.put('/api/settings', (req, res) => {
  store.updateSettings(checkSettings(req.body, { partial: true }));
  res.status(204).end();
});

app.put('/api/categories/:id', (req, res) => {
  store.upsertCategory(checkCategory(req.params.id, req.body));
  res.status(204).end();
});

app.delete('/api/categories/:id', (req, res) => {
  const moveTo = req.query.moveTo ? checkId(req.query.moveTo) : null;
  store.deleteCategory(checkId(req.params.id), moveTo);
  res.status(204).end();
});

app.put('/api/expenses/:id', (req, res) => {
  store.upsertExpense(checkExpense(req.params.id, req.body));
  res.status(204).end();
});

app.delete('/api/expenses/:id', (req, res) => {
  store.deleteExpense(checkId(req.params.id));
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  if (err instanceof BadRequest) return res.status(400).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(409).json({ error: 'That category does not exist, or still has expenses' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

/* ================= Start ================= */

const server = app.listen(PORT, HOST, () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => `  On your phone (same Wi-Fi):  http://${i.address}:${PORT}`);
  console.log([
    '',
    'Budget Tracker is running',
    `  On this computer:            http://localhost:${PORT}`,
    ...lan,
    '',
    passcode.source === 'BUDGET_PASSCODE'
      ? '  Passcode: set by BUDGET_PASSCODE'
      : `  Passcode: ${passcode.code}   (stored in ${passcode.source})`,
    `  Database: ${path.join(store.DATA_DIR, 'budget.db')}`,
    '',
  ].join('\n'));
});

function shutdown() {
  server.close(() => {
    store.db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
