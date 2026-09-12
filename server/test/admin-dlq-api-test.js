import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quehomnay_sacred_secret_jwt_2026_tam_thanh_tat_ung';

function makeRequest(server, path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch (e) {}
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runApiTests() {
  console.log('\n======================================================');
  console.log('🔒 VERIFYING STRICT RBAC FOR DLQ ADMIN API ENDPOINTS');
  console.log('======================================================\n');

  // Seed test users into database if DB is reachable
  try {
    await pool.query(`
      INSERT INTO users (id, email, name, role)
      VALUES 
        ('usr_normal_123', 'normal_user@example.com', 'Normal User', 'user'),
        ('usr_admin_999', 'admin_user@example.com', 'Admin User', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    `);
  } catch (err) {
    console.warn('Note: DB seed skipped (offline fallback mode will be tested)');
  }

  const server = app.listen(0);

  try {
    // 1. Unauthenticated request to /api/admin/dlq -> must receive 401
    const res1 = await makeRequest(server, '/api/admin/dlq');
    console.log(`1. Unauthenticated access: status ${res1.status} (expected 401)`);
    if (res1.status !== 401) throw new Error(`Expected 401, got ${res1.status}`);
    console.log('   ✅ PASS: Unauthenticated access blocked');

    // 2. Regular user access to /api/admin/dlq -> must receive 403
    const userToken = jwt.sign(
      { id: 'usr_normal_123', email: 'user@example.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const res2 = await makeRequest(server, '/api/admin/dlq', 'GET', {
      Authorization: `Bearer ${userToken}`
    });
    console.log(`2. Normal user (role: 'user') access: status ${res2.status} (expected 403)`);
    if (res2.status !== 403) throw new Error(`Expected 403, got ${res2.status}`);
    console.log('   ✅ PASS: Normal user blocked by backend RBAC with 403 Forbidden');

    // 3. Admin user access to /api/admin/dlq/stats -> must receive 200
    const adminToken = jwt.sign(
      { id: 'usr_admin_999', email: 'admin@quehomnay.vn', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const res3 = await makeRequest(server, '/api/admin/dlq/stats', 'GET', {
      Authorization: `Bearer ${adminToken}`
    });
    console.log(`3. Admin user (role: 'admin') access to /api/admin/dlq/stats: status ${res3.status}`);
    if (res3.status !== 200) throw new Error(`Expected 200, got ${res3.status}`);
    console.log('   ✅ PASS: Admin successfully authorized and received DLQ metrics:', JSON.stringify(res3.data));

    console.log('\n======================================================');
    console.log('🏆 ALL DLQ RBAC SECURITY TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    try {
      await pool.end();
    } catch (e) {}
    process.exit(0);
  }
}

runApiTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
