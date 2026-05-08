import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const dataDir = join(rootDir, '.data');
const dbPath = process.env.STITCH_CHORDS_DB ?? join(dataDir, 'stitch-chords.sqlite');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8787);

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS jam_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_interactions (
    id TEXT PRIMARY KEY,
    jam_session_id TEXT,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handleCoach(req, res) {
  const payload = await readJson(req);
  const prompt = String(payload.prompt ?? 'Make this easier to play.');
  const jamSessionId = typeof payload.jamSessionId === 'string' ? payload.jamSessionId : null;

  const response = {
    mode: process.env.OPENAI_API_KEY ? 'ai-ready-placeholder' : 'deterministic',
    message:
      'For this POC, keep the loop stable for two passes, then change only rhythm or one top note. The backend is ready to own OpenAI calls once prompts and schemas are finalized.',
    prompt,
  };

  db.prepare(`
    INSERT INTO ai_interactions (id, jam_session_id, prompt, response, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), jamSessionId, prompt, JSON.stringify(response), new Date().toISOString());
  sendJson(res, 200, response);
}

async function handleSaveJam(req, res) {
  const payload = await readJson(req);
  const id = typeof payload.id === 'string' ? payload.id : randomUUID();
  const title = typeof payload.title === 'string' ? payload.title : 'Untitled jam';
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO jam_sessions (id, title, payload, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(id, title, JSON.stringify({ ...payload, id }), now, now);
  sendJson(res, 200, { id, title, dbPath });
}

function handleListJams(_req, res) {
  const rows = db.prepare('SELECT id, title, payload, updated_at FROM jam_sessions ORDER BY updated_at DESC LIMIT 50').all().map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
    session: JSON.parse(row.payload),
  }));
  sendJson(res, 200, { rows, dbPath });
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    if (req.url === '/health' && req.method === 'GET') {
      sendJson(res, 200, { ok: true, dbPath });
      return;
    }

    if (req.url === '/api/jams' && req.method === 'GET') {
      handleListJams(req, res);
      return;
    }

    if (req.url === '/api/jams' && req.method === 'POST') {
      await handleSaveJam(req, res);
      return;
    }

    if (req.url === '/api/coach' && req.method === 'POST') {
      await handleCoach(req, res);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

server.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Jam Companion API listening on http://${host}:${port}`);
  console.log(`SQLite database: ${dbPath}`);
});
