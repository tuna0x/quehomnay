import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../app.js';
import { pool } from '../config/db.js';
import { initDb } from '../models/schema.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = 'http://127.0.0.1:' + port;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
});

test('serves a liveness response without touching the database', async () => {
  const response = await fetch(baseUrl + '/healthz');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok', service: 'quehomnay' });
});

test('rejects invalid contact messages before attempting database storage', async () => {
  const response = await fetch(baseUrl + '/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '',
      email: 'not-an-email',
      subject: '',
      message: ''
    })
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(typeof body.error, 'string');
});

test('validates auth requests without requiring a database', async () => {
  const authResponse = await fetch(baseUrl + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' })
  });
  const meResponse = await fetch(baseUrl + '/api/auth/me');
  const adminResponse = await fetch(baseUrl + '/api/admin/contact-messages');

  assert.equal(authResponse.status, 400);
  assert.equal(meResponse.status, 401);
  assert.equal(adminResponse.status, 401);
});

test('reports database readiness through the health endpoint', async () => {
  await initDb();
  const response = await fetch(baseUrl + '/api/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'healthy');
  assert.equal(body.database, 'postgresql');
});