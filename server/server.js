const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { CHRISTMAS_TIME, DEV_MODE } = require('./config');

const app = express();
const PORT = process.env.PORT || 3001;
const TIME_ZONE = 'Asia/Shanghai';
const TIMEZONE_OFFSET = '+08:00';
const DEFAULT_JUMP_TIME = CHRISTMAS_TIME;
const DEFAULT_JUMP_TIMESTAMP = Date.parse(DEFAULT_JUMP_TIME);
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
let shanghaiFormatter = null;
let jumpTimeOverride = null;
let jumpTimestampOverride = null;

try {
  shanghaiFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
} catch (err) {
  shanghaiFormatter = null;
}

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      name TEXT,
      country TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`
  );
  db.get('SELECT value FROM settings WHERE key = ?', ['jumpTime'], (err, row) => {
    if (err) {
      console.warn('Failed to load jump time override:', err);
      return;
    }
    if (!row || !row.value) {
      return;
    }
    const parsed = parseJumpTime(row.value);
    if (!parsed) {
      console.warn('Invalid jump time override stored in DB:', row.value);
      return;
    }
    setJumpTimeOverride(parsed);
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

if (!Number.isFinite(DEFAULT_JUMP_TIMESTAMP)) {
  throw new Error(`Invalid CHRISTMAS_TIME: ${CHRISTMAS_TIME}`);
}

function getShanghaiParts(date) {
  if (!shanghaiFormatter || typeof shanghaiFormatter.formatToParts !== 'function') {
    return null;
  }
  const parts = shanghaiFormatter.formatToParts(date);
  const values = {};
  parts.forEach((part) => {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  });
  return values;
}

function formatShanghaiTime(date) {
  const parts = getShanghaiParts(date);
  if (parts) {
    return (
      `${parts.year}-${parts.month}-${parts.day}` +
      `T${parts.hour}:${parts.minute}:${parts.second}` +
      `${TIMEZONE_OFFSET}`
    );
  }
  const pad = (num) => String(num).padStart(2, '0');
  const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
  return (
    `${shanghaiDate.getUTCFullYear()}-${pad(shanghaiDate.getUTCMonth() + 1)}` +
    `-${pad(shanghaiDate.getUTCDate())}` +
    `T${pad(shanghaiDate.getUTCHours())}:${pad(shanghaiDate.getUTCMinutes())}` +
    `:${pad(shanghaiDate.getUTCSeconds())}${TIMEZONE_OFFSET}`
  );
}

function getCountdownParts(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds)
  };
}

function parseJumpTime(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return { time: trimmed, timestamp };
}

function setJumpTimeOverride(parsed) {
  if (!parsed) {
    jumpTimeOverride = null;
    jumpTimestampOverride = null;
    return;
  }
  jumpTimeOverride = parsed.time;
  jumpTimestampOverride = parsed.timestamp;
}

function getActiveJumpTime() {
  if (Number.isFinite(jumpTimestampOverride)) {
    return {
      time: jumpTimeOverride,
      timestamp: jumpTimestampOverride,
      source: 'override'
    };
  }
  return {
    time: DEFAULT_JUMP_TIME,
    timestamp: DEFAULT_JUMP_TIMESTAMP,
    source: 'default'
  };
}

function getPhase() {
  const serverTime = new Date();
  const serverTimestamp = serverTime.getTime();
  const activeJump = getActiveJumpTime();
  const phase = DEV_MODE
    ? 'receive'
    : serverTimestamp < activeJump.timestamp
      ? 'send'
      : 'receive';
  const remainingMs = Math.max(0, activeJump.timestamp - serverTimestamp);
  return {
    phase,
    serverTime: formatShanghaiTime(serverTime),
    christmasTime: activeJump.time,
    jumpTime: activeJump.time,
    jumpTimeSource: activeJump.source,
    countdown: getCountdownParts(remainingMs)
  };
}

app.get('/api/phase', (req, res) => {
  res.json(getPhase());
});

app.get('/api/jump-time', (req, res) => {
  const activeJump = getActiveJumpTime();
  res.json({
    jumpTime: activeJump.time,
    jumpTimeSource: activeJump.source,
    overrideJumpTime: jumpTimeOverride,
    defaultJumpTime: DEFAULT_JUMP_TIME
  });
});

app.post('/api/jump-time', (req, res) => {
  const { jumpTime } = req.body || {};
  if (jumpTime === null || jumpTime === undefined || jumpTime === '') {
    db.run('DELETE FROM settings WHERE key = ?', ['jumpTime'], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      setJumpTimeOverride(null);
      const activeJump = getActiveJumpTime();
      return res.json({
        ok: true,
        jumpTime: activeJump.time,
        jumpTimeSource: activeJump.source
      });
    });
    return;
  }

  const parsed = parseJumpTime(jumpTime);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid jumpTime' });
  }
  db.run(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['jumpTime', parsed.time],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      setJumpTimeOverride(parsed);
      return res.json({ ok: true, jumpTime: parsed.time, jumpTimeSource: 'override' });
    }
  );
});

app.post('/api/send', (req, res) => {
  const { phase } = getPhase();
  if (phase !== 'send') {
    return res.status(403).json({ error: 'Phase locked' });
  }

  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const country = typeof req.body.country === 'string' ? req.body.country.trim() : '';

  if (!message || !country) {
    return res.status(400).json({ error: 'Missing message or country' });
  }

  db.run(
    'INSERT INTO wishes (message, name, country) VALUES (?, ?, ?)',
    [message, name || null, country],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      return res.json({ ok: true });
    }
  );
});

app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) AS count FROM wishes', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json({ count: row.count });
  });
});

app.get('/api/receive', (req, res) => {
  const requested = Number.parseInt(req.query.count, 10);
  const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 100) : 12;

  db.all(
    'SELECT message, name, country FROM wishes ORDER BY RANDOM() LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      return res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
