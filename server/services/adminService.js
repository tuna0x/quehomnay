import { pool } from '../config/db.js';
import { getTodayDateStringVN } from '../utils/dateHelper.js';
import { logActivity } from './activityService.js';
import { getLivePresenceCount } from './queueService.js';

/**
 * Get comprehensive Admin Dashboard overview metrics
 */
export async function getOverviewStats() {
  const client = await pool.connect();
  try {
    const todayVN = getTodayDateStringVN();

    // 1. Traffic Statistics
    const trafficCountsRes = await client.query(`
      SELECT 
        COUNT(*) AS total_views,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) AS today_views,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS week_views,
        COUNT(DISTINCT COALESCE(user_id, ip)) AS unique_visitors,
        COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '15 minutes' THEN COALESCE(user_id, ip) END) AS live_active
      FROM traffic_logs
    `);
    const trafficCounts = trafficCountsRes.rows[0];

    // Traffic trend: Last 7 days day-by-day
    const trafficTrendRes = await client.query(`
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        TO_CHAR(d.day, 'DD/MM') AS label,
        COALESCE(COUNT(t.id), 0) AS views,
        COALESCE(COUNT(DISTINCT COALESCE(t.user_id, t.ip)), 0) AS visitors
      FROM (
        SELECT GENERATE_SERIES(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS day
      ) d
      LEFT JOIN traffic_logs t ON DATE(t.created_at) = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    // Device breakdown (Mobile vs Desktop)
    const deviceRes = await client.query(`
      SELECT 
        CASE 
          WHEN user_agent ILIKE '%Mobile%' OR user_agent ILIKE '%Android%' OR user_agent ILIKE '%iPhone%' THEN 'Di động (Mobile)'
          WHEN user_agent ILIKE '%Tablet%' OR user_agent ILIKE '%iPad%' THEN 'Máy tính bảng (Tablet)'
          ELSE 'Máy tính (Desktop)'
        END AS device_type,
        COUNT(*) AS count
      FROM traffic_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // Top visited paths
    const topPathsRes = await client.query(`
      SELECT path, COUNT(*) as hits
      FROM traffic_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY path
      ORDER BY hits DESC
      LIMIT 6
    `);

    // 2. User Statistics
    const userStatsRes = await client.query(`
      SELECT 
        COUNT(CASE WHEN email IS NOT NULL THEN 1 END) AS total_registered,
        COUNT(CASE WHEN email IS NOT NULL AND created_at >= CURRENT_DATE THEN 1 END) AS today_registered,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admin_count,
        COUNT(CASE WHEN role = 'user' AND email IS NOT NULL THEN 1 END) AS regular_user_count,
        COUNT(CASE WHEN provider = 'google' THEN 1 END) AS google_users,
        COUNT(CASE WHEN provider = 'email' THEN 1 END) AS email_users,
        COUNT(CASE WHEN email IS NULL THEN 1 END) AS anonymous_devices
      FROM users
    `);
    const userStats = userStatsRes.rows[0];

    // 3. Fortune Draw Statistics
    const drawStatsRes = await client.query(`
      SELECT 
        COUNT(*) AS total_draws,
        COUNT(CASE WHEN draw_date = $1 THEN 1 END) AS today_draws,
        COUNT(CASE WHEN is_ai = TRUE THEN 1 END) AS ai_draws
      FROM draws
    `, [todayVN]);
    const drawStats = drawStatsRes.rows[0];

    // 4. Recent activities snippet (5 latest)
    const recentActivitiesRes = await client.query(`
      SELECT id, user_id, user_email, user_name, action_type, details, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 5. Real-time Live Presence from Redis / in-memory buffer
    const livePresence = await getLivePresenceCount();

    return {
      traffic: {
        totalViews: parseInt(trafficCounts.total_views, 10) || 0,
        todayViews: parseInt(trafficCounts.today_views, 10) || 0,
        weekViews: parseInt(trafficCounts.week_views, 10) || 0,
        uniqueVisitors: parseInt(trafficCounts.unique_visitors, 10) || 0,
        liveActive: Math.max(livePresence, parseInt(trafficCounts.live_active, 10) || 1),
        trend7Days: trafficTrendRes.rows.map(r => ({
          date: r.date,
          label: r.label,
          views: parseInt(r.views, 10),
          visitors: parseInt(r.visitors, 10)
        })),
        devices: deviceRes.rows.map(r => ({
          type: r.device_type,
          count: parseInt(r.count, 10)
        })),
        topPaths: topPathsRes.rows.map(r => ({
          path: r.path,
          hits: parseInt(r.hits, 10)
        }))
      },
      users: {
        totalRegistered: parseInt(userStats.total_registered, 10) || 0,
        todayRegistered: parseInt(userStats.today_registered, 10) || 0,
        adminCount: parseInt(userStats.admin_count, 10) || 0,
        regularUserCount: parseInt(userStats.regular_user_count, 10) || 0,
        googleUsers: parseInt(userStats.google_users, 10) || 0,
        emailUsers: parseInt(userStats.email_users, 10) || 0,
        anonymousDevices: parseInt(userStats.anonymous_devices, 10) || 0
      },
      draws: {
        totalDraws: parseInt(drawStats.total_draws, 10) || 0,
        todayDraws: parseInt(drawStats.today_draws, 10) || 0,
        aiDraws: parseInt(drawStats.ai_draws, 10) || 0
      },
      recentActivities: recentActivitiesRes.rows
    };
  } finally {
    client.release();
  }
}

/**
 * Get detailed paginated traffic logs
 */
export async function getTrafficLogs({ page = 1, limit = 25, path = '' }) {
  const client = await pool.connect();
  try {
    const offset = (Math.max(1, page) - 1) * limit;
    let whereClause = '';
    const params = [];

    if (path) {
      params.push(`%${path}%`);
      whereClause = `WHERE path ILIKE $${params.length}`;
    }

    const countRes = await client.query(`
      SELECT COUNT(*) FROM traffic_logs ${whereClause}
    `, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const listParams = [...params, limit, offset];
    const listRes = await client.query(`
      SELECT id, path, method, ip, user_agent, referrer, user_id, status_code, response_time_ms, created_at
      FROM traffic_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
    `, listParams);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      logs: listRes.rows
    };
  } finally {
    client.release();
  }
}

/**
 * Get paginated user management list with draw counts
 */
export async function getUsersList({ page = 1, limit = 20, search = '', role = '' }) {
  const client = await pool.connect();
  try {
    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = ['email IS NOT NULL'];
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
    }

    if (role && role !== 'all') {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await client.query(`
      SELECT COUNT(*) FROM users ${whereClause}
    `, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const listParams = [...params, limit, offset];
    const listRes = await client.query(`
      SELECT 
        u.id, u.email, u.name, u.avatar_url, u.role, u.provider, 
        u.extra_draws, u.invite_count, u.created_at, u.last_login_at,
        (SELECT COUNT(*) FROM draws d WHERE d.user_id = u.id) AS total_draws
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
    `, listParams);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users: listRes.rows.map(row => ({
        id: row.id,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatar_url,
        role: row.role,
        provider: row.provider,
        extraDraws: row.extra_draws || 0,
        inviteCount: row.invite_count || 0,
        totalDraws: parseInt(row.total_draws, 10) || 0,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at
      }))
    };
  } finally {
    client.release();
  }
}

/**
 * Update user role (promote to admin or demote to regular user)
 */
export async function updateUserRole({ targetUserId, newRole, adminUser, ip }) {
  if (!['admin', 'user'].includes(newRole)) {
    const error = new Error('Vai trò không hợp lệ. Chỉ chấp nhận "admin" hoặc "user".');
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();
  try {
    // Check target user
    const targetRes = await client.query('SELECT id, email, name, role FROM users WHERE id = $1', [targetUserId]);
    if (targetRes.rows.length === 0) {
      const error = new Error('Không tìm thấy người dùng.');
      error.statusCode = 404;
      throw error;
    }
    const targetUser = targetRes.rows[0];

    // Check if demoting the last admin
    if (targetUser.role === 'admin' && newRole === 'user') {
      const adminCountRes = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
      const adminCount = parseInt(adminCountRes.rows[0].count, 10);
      if (adminCount <= 1) {
        const error = new Error('Không thể hạ quyền Admin cuối cùng của hệ thống.');
        error.statusCode = 400;
        throw error;
      }
    }

    await client.query(`
      UPDATE users 
      SET role = $1, updated_at = NOW() 
      WHERE id = $2
    `, [newRole, targetUserId]);

    // Record activity log
    await logActivity({
      userId: adminUser.id,
      userEmail: adminUser.email,
      userName: adminUser.name,
      actionType: 'ROLE_CHANGE',
      details: {
        targetUserId,
        targetEmail: targetUser.email,
        targetName: targetUser.name,
        previousRole: targetUser.role,
        newRole
      },
      ip
    });

    return {
      success: true,
      userId: targetUserId,
      newRole
    };
  } finally {
    client.release();
  }
}

/**
 * Get paginated activity stream logs
 */
export async function getActivityLogs({ page = 1, limit = 25, actionType = '', search = '' }) {
  const client = await pool.connect();
  try {
    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = [];
    const params = [];

    if (actionType && actionType !== 'all') {
      params.push(actionType);
      conditions.push(`action_type = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(user_name) LIKE $${params.length} OR LOWER(user_email) LIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await client.query(`
      SELECT COUNT(*) FROM activity_logs ${whereClause}
    `, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const listParams = [...params, limit, offset];
    const listRes = await client.query(`
      SELECT id, user_id, user_email, user_name, action_type, details, ip, created_at
      FROM activity_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
    `, listParams);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      activities: listRes.rows
    };
  } finally {
    client.release();
  }
}
