import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  BarChart3, 
  Users, 
  Activity, 
  RefreshCw, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  Monitor, 
  Compass, 
  CheckCircle2, 
  UserCheck,
  UserX,
  Radio,
  Layers,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Server,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';

export default function AdminDashboardModal({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'activities' | 'dlq'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Overview stats state
  const [overview, setOverview] = useState(null);

  // Users management state
  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 1, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Activities state
  const [activitiesData, setActivitiesData] = useState({ activities: [], total: 0, page: 1, totalPages: 1 });
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);

  // DLQ & Queue status state
  const [queueStats, setQueueStats] = useState(null);
  const [dlqJobsData, setDlqJobsData] = useState({ jobs: [], total: 0, page: 1, totalPages: 1 });
  const [dlqStatusFilter, setDlqStatusFilter] = useState('all');
  const [dlqTypeFilter, setDlqTypeFilter] = useState('all');
  const [dlqPage, setDlqPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (err) {
      setError(err.data?.error || err.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Users List
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers({
        page,
        limit: 12,
        search: userSearch,
        role: userRoleFilter
      });
      setUsersData(data);
    } catch (err) {
      setError(err.data?.error || err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [userSearch, userRoleFilter]);

  // Fetch Activities List
  const fetchActivities = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getActivities({
        page,
        limit: 15,
        actionType: activityFilter,
        search: activitySearch
      });
      setActivitiesData(data);
    } catch (err) {
      setError(err.data?.error || err.message || 'Không thể tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  }, [activityFilter, activitySearch]);

  // Fetch Queue & DLQ Stats
  const fetchQueueStats = useCallback(async () => {
    try {
      const data = await adminApi.getDLQStats();
      setQueueStats(data);
    } catch (err) {
      console.warn('Could not fetch queue stats:', err);
    }
  }, []);

  // Fetch DLQ Jobs List
  const fetchDLQJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDLQJobs({
        page,
        limit: 10,
        status: dlqStatusFilter,
        jobType: dlqTypeFilter
      });
      setDlqJobsData(data);
      await fetchQueueStats();
    } catch (err) {
      setError(err.data?.error || err.message || 'Không thể tải danh sách hàng đợi lỗi DLQ');
    } finally {
      setLoading(false);
    }
  }, [dlqStatusFilter, dlqTypeFilter, fetchQueueStats]);

  // Retry a single DLQ failed job
  const handleRetryJob = async (jobId) => {
    try {
      setLoading(true);
      await adminApi.retryDLQJob(jobId);
      setActionSuccess(`Đã thử lại thành công tác vụ #${jobId}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      await fetchDLQJobs(dlqPage);
    } catch (err) {
      setError(err.data?.error || err.message || 'Lỗi khi thử lại tác vụ');
    } finally {
      setLoading(false);
    }
  };

  // Discard a single DLQ failed job
  const handleDiscardJob = async (jobId) => {
    if (!window.confirm(`Bạn có chắc muốn bỏ qua tác vụ #${jobId} khỏi hàng đợi?`)) return;
    try {
      setLoading(true);
      await adminApi.discardDLQJob(jobId);
      setActionSuccess(`Đã bỏ qua tác vụ #${jobId}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      await fetchDLQJobs(dlqPage);
    } catch (err) {
      setError(err.data?.error || err.message || 'Lỗi khi bỏ qua tác vụ');
    } finally {
      setLoading(false);
    }
  };

  // Retry all failed jobs in DLQ
  const handleRetryAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn thử lại toàn bộ các tác vụ lỗi trong DLQ?')) return;
    try {
      setLoading(true);
      const res = await adminApi.retryAllDLQ();
      setActionSuccess(`Đã thử lại toàn bộ: ${res.succeeded}/${res.total} thành công.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await fetchDLQJobs(dlqPage);
    } catch (err) {
      setError(err.data?.error || err.message || 'Lỗi khi thử lại tất cả tác vụ');
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (!isOpen) return;
    if (!currentUser || currentUser.role !== 'admin') return;

    fetchQueueStats();

    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'users') {
      fetchUsers(userPage);
    } else if (activeTab === 'activities') {
      fetchActivities(activityPage);
    } else if (activeTab === 'dlq') {
      fetchDLQJobs(dlqPage);
    }
  }, [isOpen, currentUser, activeTab, fetchOverview, fetchUsers, fetchActivities, fetchDLQJobs, fetchQueueStats, userPage, activityPage, dlqPage]);

  // Handle user role promotion / demotion
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionName = newRole === 'admin' ? 'thăng cấp Quản trị viên (Admin)' : 'chuyển về Người dùng thường (User)';
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} cho tài khoản "${targetUser.email}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.updateUserRole(targetUser.id, newRole);
      setActionSuccess(`Đã cập nhật vai trò của ${targetUser.email} thành ${newRole.toUpperCase()} thành công.`);
      setTimeout(() => setActionSuccess(null), 4000);
      await fetchUsers(userPage);
    } catch (err) {
      setError(err.data?.error || err.message || 'Lỗi khi thay đổi vai trò');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Strict role guard: if user is not admin, deny access immediately
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-md p-6 rounded-xl bg-gradient-to-b from-[#2A0806] to-[#120302] border-2 border-red-500/60 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/80 border border-red-500/80 flex items-center justify-center text-red-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-serif font-bold text-red-200">Truy Cập Bị Từ Chối</h2>
          <p className="text-xs font-serif text-paper-light/80 leading-relaxed">
            Khu vực này chỉ dành riêng cho <strong>Quản trị viên (Admin)</strong>. Tài khoản của bạn hiện là <strong>Đạo Hữu (User)</strong> nên không có quyền truy cập vào Bảng Quản Trị.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#6E1B1B] to-[#942626] border border-gold-bright text-paper-light font-serif text-xs font-bold hover:brightness-115 transition"
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Admin Window Frame */}
      <div 
        className="w-full max-w-5xl h-[92vh] max-h-[900px] bg-gradient-to-b from-[#250705] via-[#180403] to-[#0E0202] border-2 border-gold-bright/70 rounded-xl shadow-[0_0_50px_rgba(201,162,74,0.4)] flex flex-col overflow-hidden relative text-paper-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ornamental Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4A100C] via-[#631612] to-[#4A100C] border-b border-gold-bright/40 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#2B0605] border-2 border-gold-bright flex items-center justify-center shadow-gold-glow">
              <ShieldCheck className="text-gold-bright" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-bold text-gold-pale leading-tight tracking-wide">
                  Bảng Quản Trị Hệ Thống
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gold-ancient/20 border border-gold-bright/50 text-gold-bright text-[10px] font-mono uppercase font-bold tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-gold-ancient/80 font-serif">
                Theo dõi lưu lượng truy cập, người dùng và nhật ký hoạt động thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchOverview();
                if (activeTab === 'users') fetchUsers(userPage);
                if (activeTab === 'activities') fetchActivities(activityPage);
                if (activeTab === 'dlq') fetchDLQJobs(dlqPage);
              }}
              title="Làm mới dữ liệu"
              className="h-8 px-2.5 rounded-md bg-lacquer-deep/70 border border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center gap-1.5 text-xs font-serif shadow"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-gold-bright" : ""} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-lacquer-deep/70 border border-gold-ancient/30 text-gold-pale hover:text-gold-bright hover:border-gold-bright flex items-center justify-center transition shadow"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gold-ancient/20 bg-[#120302] px-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-serif font-bold tracking-wider uppercase transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-gold-bright border-gold-bright bg-[#240604]/70 shadow-sm'
                : 'text-gold-muted hover:text-gold-pale border-transparent'
            }`}
          >
            <BarChart3 size={15} />
            <span>Tổng Quan & Lưu Lượng</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-serif font-bold tracking-wider uppercase transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-gold-bright border-gold-bright bg-[#240604]/70 shadow-sm'
                : 'text-gold-muted hover:text-gold-pale border-transparent'
            }`}
          >
            <Users size={15} />
            <span>Quản Lý Người Dùng</span>
            {overview?.users?.totalRegistered !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#481210] border border-gold-ancient/40 text-[10px] text-gold-pale font-mono">
                {overview.users.totalRegistered}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-4 text-xs font-serif font-bold tracking-wider uppercase transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'activities'
                ? 'text-gold-bright border-gold-bright bg-[#240604]/70 shadow-sm'
                : 'text-gold-muted hover:text-gold-pale border-transparent'
            }`}
          >
            <Activity size={15} />
            <span>Nhật Ký Hoạt Động</span>
          </button>

          <button
            onClick={() => setActiveTab('dlq')}
            className={`py-3 px-4 text-xs font-serif font-bold tracking-wider uppercase transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'dlq'
                ? 'text-gold-bright border-gold-bright bg-[#240604]/70 shadow-sm'
                : 'text-gold-muted hover:text-gold-pale border-transparent'
            }`}
          >
            <Layers size={15} />
            <span>Hàng Đợi & DLQ</span>
            {queueStats?.dlq?.failed > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-950 border border-red-500/80 text-[10px] text-red-300 font-mono font-bold animate-pulse">
                {queueStats.dlq.failed}
              </span>
            )}
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-red-950/90 border border-red-500/70 text-red-200 text-xs font-serif flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
          </div>
        )}

        {actionSuccess && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-serif flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Body Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* ============================================================== */}
          {/* TAB 1: OVERVIEW & TRAFFIC ANALYTICS                            */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Fast Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Traffic Views */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden group hover:border-gold-bright/60 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Lưu Lượng Truy Cập</span>
                    <div className="w-7 h-7 rounded-md bg-gold-ancient/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright">
                      <Eye size={15} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-black gold-text-gradient mb-1">
                    {(overview?.traffic?.totalViews || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-paper-light/75">
                    <span className="text-emerald-400 font-bold">+{overview?.traffic?.todayViews || 0}</span>
                    <span>hôm nay</span>
                    <span className="text-gold-ancient/50">•</span>
                    <span>{overview?.traffic?.weekViews || 0} tuần này</span>
                  </div>
                </div>

                {/* 2. Registered Users */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden group hover:border-gold-bright/60 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Người Dùng Đăng Ký</span>
                    <div className="w-7 h-7 rounded-md bg-gold-ancient/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright">
                      <Users size={15} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-black gold-text-gradient mb-1">
                    {(overview?.users?.totalRegistered || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-paper-light/75">
                    <span className="text-emerald-400 font-bold">+{overview?.users?.todayRegistered || 0}</span>
                    <span>mới hôm nay</span>
                    <span className="text-gold-ancient/50">•</span>
                    <span>{overview?.users?.adminCount || 0} Admin</span>
                  </div>
                </div>

                {/* 3. Total Draws */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden group hover:border-gold-bright/60 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Tổng Lượt Xin Quẻ</span>
                    <div className="w-7 h-7 rounded-md bg-gold-ancient/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright">
                      <Sparkles size={15} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-black gold-text-gradient mb-1">
                    {(overview?.draws?.totalDraws || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-paper-light/75">
                    <span className="text-emerald-400 font-bold">{overview?.draws?.todayDraws || 0}</span>
                    <span>hôm nay</span>
                    <span className="text-gold-ancient/50">•</span>
                    <span>{overview?.draws?.aiDraws || 0} quẻ AI</span>
                  </div>
                </div>

                {/* 4. Live Active Users */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden group hover:border-gold-bright/60 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Đang Trực Tuyến</span>
                    <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Radio size={15} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-black text-emerald-400 mb-1 flex items-center gap-2">
                    <span>{overview?.traffic?.liveActive || 1}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <div className="text-[11px] text-paper-light/75">
                    Trong 15 phút vừa qua ({overview?.traffic?.uniqueVisitors || 0} khách duy nhất)
                  </div>
                </div>
              </div>

              {/* 7-Day Traffic Trend Bar Chart */}
              <div className="p-5 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={17} className="text-gold-bright" />
                    <h2 className="text-sm font-serif font-bold text-gold-pale">
                      Biểu Đồ Xu Hướng Lưu Lượng (7 Ngày Gần Nhất)
                    </h2>
                  </div>
                  <span className="text-[11px] text-gold-muted font-serif">
                    Đơn vị: Lượt xem trang & Hành động API
                  </span>
                </div>

                {/* SVG/CSS Bar Chart */}
                <div className="pt-4 pb-2">
                  {overview?.traffic?.trend7Days && overview.traffic.trend7Days.length > 0 ? (
                    <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-gold-ancient/20 pb-2">
                      {(() => {
                        const maxVal = Math.max(...overview.traffic.trend7Days.map(d => d.views), 10);
                        return overview.traffic.trend7Days.map((item, idx) => {
                          const heightPercent = Math.max(8, Math.round((item.views / maxVal) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                              {/* Hover Value Tooltip */}
                              <span className="text-[10px] font-mono text-gold-bright font-bold opacity-0 group-hover:opacity-100 transition duration-150">
                                {item.views}
                              </span>
                              {/* Bar */}
                              <div 
                                style={{ height: `${heightPercent}%` }}
                                className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-[#6E1B1B] via-[#A82E2E] to-[#E7C978] shadow-gold-glow group-hover:brightness-125 transition-all duration-300 relative"
                              >
                                {item.visitors > 0 && (
                                  <div 
                                    style={{ height: `${Math.min(100, Math.round((item.visitors / (item.views || 1)) * 100))}%` }} 
                                    className="w-full bg-gold-bright/30 rounded-t-md absolute bottom-0 left-0"
                                  />
                                )}
                              </div>
                              {/* Date Label */}
                              <span className="text-[10px] font-serif text-gold-pale/80 font-medium">
                                {item.label}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-xs font-serif text-gold-muted">
                      Đang cập nhật số liệu biểu đồ...
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-6 mt-3 text-[11px] font-serif text-gold-muted">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-[#6E1B1B] to-[#E7C978]"></span>
                      <span>Lượt truy cập (Views)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-gold-bright/40"></span>
                      <span>Khách duy nhất (Visitors)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Devices breakdown & Top Visited Paths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Devices */}
                <div className="p-4 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow space-y-3">
                  <div className="flex items-center gap-2 text-gold-pale font-serif font-bold text-xs">
                    <Monitor size={15} className="text-gold-bright" />
                    <span>Phân Bổ Thiết Bị Truy Cập</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {overview?.traffic?.devices && overview.traffic.devices.length > 0 ? (
                      overview.traffic.devices.map((d, i) => {
                        const total = overview.traffic.devices.reduce((acc, curr) => acc + curr.count, 0) || 1;
                        const pct = Math.round((d.count / total) * 100);
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-serif">
                              <span className="text-paper-light">{d.type}</span>
                              <span className="text-gold-bright font-mono font-semibold">{d.count} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#120302] overflow-hidden border border-gold-ancient/20">
                              <div 
                                style={{ width: `${pct}%` }} 
                                className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#E7C978] rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gold-muted font-serif">Chưa có đủ số liệu phân bổ thiết bị.</p>
                    )}
                  </div>
                </div>

                {/* Top Visited Routes */}
                <div className="p-4 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow space-y-3">
                  <div className="flex items-center gap-2 text-gold-pale font-serif font-bold text-xs">
                    <Compass size={15} className="text-gold-bright" />
                    <span>Các Đường Dẫn & Tính Năng Hàng Đầu</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {overview?.traffic?.topPaths && overview.traffic.topPaths.length > 0 ? (
                      overview.traffic.topPaths.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#140302] border border-gold-ancient/15 text-xs font-mono">
                          <span className="text-gold-pale truncate max-w-[220px]">{p.path}</span>
                          <span className="text-gold-bright font-bold shrink-0">{p.hits} hits</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gold-muted font-serif">Chưa có thông tin đường dẫn.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: USER MANAGEMENT                                         */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchUsers(1);
                    }}
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#140302] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="py-2 px-3 rounded-lg bg-[#140302] border border-gold-ancient/30 text-xs font-serif text-gold-pale outline-none focus:border-gold-bright"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="user">Đạo hữu (User)</option>
                  </select>

                  <button
                    onClick={() => fetchUsers(1)}
                    className="px-3 py-2 rounded-lg bg-gold-ancient text-lacquer-deep font-serif font-bold text-xs hover:bg-gold-bright transition shadow"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-serif">
                    <thead className="bg-[#2A0907] border-b border-gold-ancient/30 text-gold-bright uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Người Dùng</th>
                        <th className="py-3 px-3">Phương Thức</th>
                        <th className="py-3 px-3">Vai Trò</th>
                        <th className="py-3 px-3">Quẻ Đã Gieo</th>
                        <th className="py-3 px-3">Ngày Tham Gia</th>
                        <th className="py-3 px-4 text-right">Thao Tác Phân Quyền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-ancient/15">
                      {usersData.users && usersData.users.length > 0 ? (
                        usersData.users.map((u) => {
                          const isSelf = currentUser && currentUser.id === u.id;
                          return (
                            <tr key={u.id} className="hover:bg-[#290806]/60 transition">
                              {/* Avatar & User Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#2B0605] border border-gold-bright/60 flex items-center justify-center font-bold text-gold-bright text-xs shrink-0 shadow">
                                    {u.avatarUrl ? (
                                      <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      (u.name || u.email || 'U').charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-gold-pale block leading-tight">
                                      {u.name || 'Chưa đặt tên'}
                                      {isSelf && <span className="ml-1.5 text-[10px] text-gold-bright">(Bạn)</span>}
                                    </span>
                                    <span className="text-[11px] text-gold-muted font-mono block">
                                      {u.email}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Auth Provider */}
                              <td className="py-3 px-3">
                                {u.provider === 'google' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-400/40 text-blue-200 text-[10px] font-mono">
                                    Google
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3A0F0C] border border-gold-ancient/30 text-gold-pale text-[10px] font-mono">
                                    Email
                                  </span>
                                )}
                              </td>

                              {/* Role Badge */}
                              <td className="py-3 px-3">
                                {u.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/30 border border-gold-bright text-gold-bright font-bold text-[10px] shadow-sm">
                                    <Shield size={11} />
                                    Quản Trị (Admin)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1F0806] border border-gold-ancient/20 text-gold-muted text-[10px]">
                                    Đạo Hữu (User)
                                  </span>
                                )}
                              </td>

                              {/* Total Draws */}
                              <td className="py-3 px-3 font-mono font-bold text-gold-bright">
                                {u.totalDraws || 0}
                              </td>

                              {/* Joined Date */}
                              <td className="py-3 px-3 text-[11px] text-paper-light/75 font-mono">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                {isSelf ? (
                                  <span className="text-[11px] text-gold-muted italic">Tài khoản hiện tại</span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleRole(u)}
                                    className={`px-3 py-1 rounded border text-[11px] font-serif font-semibold transition flex items-center gap-1 ml-auto shadow ${
                                      u.role === 'admin'
                                        ? 'bg-red-950/70 border-red-500/50 text-red-200 hover:bg-red-900/90'
                                        : 'bg-gold-ancient/20 border-gold-bright text-gold-bright hover:bg-gold-ancient hover:text-lacquer-deep'
                                    }`}
                                  >
                                    {u.role === 'admin' ? (
                                      <>
                                        <UserX size={13} />
                                        <span>Hạ quyền User</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={13} />
                                        <span>Thăng cấp Admin</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gold-muted font-serif">
                            Không tìm thấy người dùng phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersData.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gold-ancient/20 bg-[#140302] flex items-center justify-between text-xs font-serif text-gold-pale">
                    <span>
                      Trang {usersData.page} / {usersData.totalPages} (Tổng {usersData.total} người dùng)
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        disabled={usersData.page <= 1}
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                      >
                        Trước
                      </button>
                      <button
                        disabled={usersData.page >= usersData.totalPages}
                        onClick={() => setUserPage(p => p + 1)}
                        className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: USER ACTIVITY LOGS                                      */}
          {/* ============================================================== */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/30 shadow">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchActivities(1);
                    }}
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#140302] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="py-2 px-3 rounded-lg bg-[#140302] border border-gold-ancient/30 text-xs font-serif text-gold-pale outline-none focus:border-gold-bright"
                  >
                    <option value="all">Tất cả hoạt động</option>
                    <option value="DRAW_FORTUNE">Xin Quẻ (DRAW_FORTUNE)</option>
                    <option value="AUTH_LOGIN">Đăng Nhập (AUTH_LOGIN)</option>
                    <option value="AUTH_REGISTER">Đăng Ký (AUTH_REGISTER)</option>
                    <option value="INVITE_BONUS">Nhận Thưởng Mời Bạn (INVITE_BONUS)</option>
                    <option value="REFERRAL_CLICK">Khách Mở Link Mời (REFERRAL_CLICK)</option>
                    <option value="AI_CHAT">Đàm Đạo Với AI (AI_CHAT)</option>
                    <option value="SHARE_FORTUNE">Chia Sẻ Quẻ (SHARE_FORTUNE)</option>
                    <option value="ROLE_CHANGE">Đổi Quyền (ROLE_CHANGE)</option>
                  </select>

                  <button
                    onClick={() => fetchActivities(1)}
                    className="px-3 py-2 rounded-lg bg-gold-ancient text-lacquer-deep font-serif font-bold text-xs hover:bg-gold-bright transition shadow"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* Activity Timeline List */}
              <div className="space-y-2.5">
                {activitiesData.activities && activitiesData.activities.length > 0 ? (
                  activitiesData.activities.map((act) => {
                    let badgeColor = 'bg-gold-ancient/20 border-gold-bright text-gold-bright';
                    let badgeLabel = act.action_type;

                    if (act.action_type === 'DRAW_FORTUNE') {
                      badgeColor = 'bg-amber-950/80 border-amber-500 text-amber-300';
                      badgeLabel = 'Xin Quẻ';
                    } else if (act.action_type === 'AUTH_LOGIN') {
                      badgeColor = 'bg-blue-950/80 border-blue-500 text-blue-300';
                      badgeLabel = 'Đăng Nhập';
                    } else if (act.action_type === 'AUTH_REGISTER') {
                      badgeColor = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                      badgeLabel = 'Đăng Ký Mới';
                    } else if (act.action_type === 'INVITE_BONUS') {
                      badgeColor = 'bg-yellow-950/80 border-yellow-500 text-yellow-300';
                      badgeLabel = 'Thưởng Mời Bạn';
                    } else if (act.action_type === 'REFERRAL_CLICK') {
                      badgeColor = 'bg-teal-950/80 border-teal-500 text-teal-300';
                      badgeLabel = 'Mở Link Mời';
                    } else if (act.action_type === 'AI_CHAT') {
                      badgeColor = 'bg-pink-950/80 border-pink-500 text-pink-300';
                      badgeLabel = 'Đàm Đạo AI';
                    } else if (act.action_type === 'SHARE_FORTUNE') {
                      badgeColor = 'bg-cyan-950/80 border-cyan-500 text-cyan-300';
                      badgeLabel = 'Chia Sẻ Quẻ';
                    } else if (act.action_type === 'ROLE_CHANGE') {
                      badgeColor = 'bg-purple-950/80 border-purple-500 text-purple-300';
                      badgeLabel = 'Đổi Quyền';
                    }

                    const details = typeof act.details === 'string' ? JSON.parse(act.details || '{}') : (act.details || {});

                    return (
                      <div 
                        key={act.id} 
                        className="p-3.5 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/25 hover:border-gold-bright/50 transition shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-serif"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                              {badgeLabel}
                            </span>
                            <span className="font-bold text-gold-pale">
                              {act.user_name || act.user_email || act.user_id || 'Khách vãng lai'}
                            </span>
                            {act.user_email && (
                              <span className="text-[11px] text-gold-muted font-mono hidden sm:inline">
                                ({act.user_email})
                              </span>
                            )}
                          </div>

                          {/* Specific action details preview */}
                          <div className="text-[11px] text-paper-light/80 pl-1">
                            {act.action_type === 'DRAW_FORTUNE' && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span>Gieo được: <strong className="text-gold-bright">{details.ten_que || 'Quẻ'}</strong></span>
                                {details.muc && <span className="text-gold-ancient">[{details.muc}]</span>}
                                {details.topic && <span className="text-gold-muted/80">• {details.topic}</span>}
                                {details.userQuestion && (
                                  <span className="italic text-paper-light/70 truncate max-w-xs">
                                    - "{details.userQuestion}"
                                  </span>
                                )}
                              </div>
                            )}

                            {act.action_type === 'ROLE_CHANGE' && (
                              <div>
                                Thay đổi quyền của <strong className="text-gold-bright">{details.targetEmail}</strong> thành <span className="uppercase text-gold-pale font-mono font-bold">[{details.newRole}]</span>
                              </div>
                            )}

                            {(act.action_type === 'AUTH_LOGIN' || act.action_type === 'AUTH_REGISTER') && (
                              <div>
                                Phương thức: <strong className="text-gold-bright uppercase font-mono">{details.provider || 'email'}</strong>
                                {details.role && <span> • Vai trò: [{details.role}]</span>}
                              </div>
                            )}

                            {act.action_type === 'INVITE_BONUS' && (
                              <div>
                                Đã nhận thêm <strong className="text-gold-bright">+{details.extraDraws || 1}</strong> lượt gieo quẻ nhờ gửi link mời bạn bè (Tổng: {details.inviteCount || 1} bạn).
                              </div>
                            )}

                            {act.action_type === 'REFERRAL_CLICK' && (
                              <div>
                                Có khách bấm vào liên kết mời gieo quẻ (Khách: <span className="font-mono text-gold-pale">{details.visitorId}</span>). Cả hai nhận thưởng!
                              </div>
                            )}

                            {act.action_type === 'AI_CHAT' && (
                              <div>
                                Đàm đạo cùng AI Luna về quẻ <strong className="text-gold-bright">{details.fortune || 'Chiêm nghiệm'}</strong> {details.userQuestion && <span className="italic">"{details.userQuestion}"</span>} ({details.messagesCount || 1} lượt trao đổi).
                              </div>
                            )}

                            {act.action_type === 'SHARE_FORTUNE' && (
                              <div>
                                Đã {details.type === 'download_image' ? 'tải ảnh' : 'sao chép liên kết chia sẻ'} quẻ <strong className="text-gold-bright">{details.ten_que}</strong> cho bạn bè.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp & IP */}
                        <div className="text-[11px] text-gold-muted/80 font-mono flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                          <span>{new Date(act.created_at).toLocaleString('vi-VN')}</span>
                          {act.ip && <span className="text-[10px] text-gold-ancient/50">{act.ip}</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-gold-muted font-serif">
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </div>
                )}
              </div>

              {/* Activity Pagination */}
              {activitiesData.totalPages > 1 && (
                <div className="px-4 py-3 rounded-xl border border-gold-ancient/20 bg-[#140302] flex items-center justify-between text-xs font-serif text-gold-pale">
                  <span>
                    Trang {activitiesData.page} / {activitiesData.totalPages} (Tổng {activitiesData.total} sự kiện)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      disabled={activitiesData.page <= 1}
                      onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                    >
                      Trước
                    </button>
                    <button
                      disabled={activitiesData.page >= activitiesData.totalPages}
                      onClick={() => setActivityPage(p => p + 1)}
                      className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: QUEUES & DEAD LETTER QUEUE (DLQ)                        */}
          {/* ============================================================== */}
          {activeTab === 'dlq' && (
            <div className="space-y-6">
              {/* 4 Engine & Queue Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Redis Server Status */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Hạ Tầng Redis</span>
                    <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${
                      queueStats?.redisOnline 
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                    }`}>
                      <Server size={15} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      queueStats?.redisOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    <span className="text-base sm:text-lg font-serif font-bold text-gold-pale">
                      {queueStats?.redisOnline ? 'Redis Online' : 'Hybrid Memory'}
                    </span>
                  </div>
                  <div className="text-[11px] text-paper-light/70 font-serif">
                    {queueStats?.redisOnline ? 'Đang kết nối Redis phân tán' : 'Chế độ bộ nhớ đệm RAM dự phòng'}
                  </div>
                </div>

                {/* 2. Draw Mutex Lock Queue */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Khóa Rút Quẻ (Mutex)</span>
                    <div className="w-7 h-7 rounded-md bg-gold-ancient/10 border border-gold-bright/30 flex items-center justify-center text-gold-bright">
                      <Layers size={15} />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-black gold-text-gradient mb-1">
                    {queueStats?.drawQueue?.activeLocksCount || 0}
                    <span className="text-xs font-normal text-gold-muted ml-1.5">đang khóa</span>
                  </div>
                  <div className="text-[11px] text-paper-light/70 font-serif">
                    Đã xử lý: {queueStats?.drawQueue?.totalDrawsProcessed || 0} • Chặn spam: {queueStats?.drawQueue?.totalLocksBlocked || 0}
                  </div>
                </div>

                {/* 3. AI Concurrency Queue */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Hàng Đợi AI Luna</span>
                    <div className="w-7 h-7 rounded-md bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-purple-300">
                      <Cpu size={15} />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-black text-purple-300 mb-1">
                    {queueStats?.aiQueue?.activeWorkers || 0}
                    <span className="text-xs font-normal text-purple-400/70 ml-1">/ {queueStats?.aiQueue?.maxConcurrency || 5} luồng</span>
                  </div>
                  <div className="text-[11px] text-paper-light/70 font-serif">
                    Đang đợi: {queueStats?.aiQueue?.pendingQueueLength || 0} • Thử lại: {queueStats?.aiQueue?.totalAiRetried || 0}
                  </div>
                </div>

                {/* 4. Dead Letter Queue */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F0B09] to-[#1C0504] border border-gold-ancient/30 shadow relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-serif text-gold-muted uppercase tracking-wider">Hàng Đợi Lỗi (DLQ)</span>
                    <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${
                      (queueStats?.dlq?.failed || 0) > 0
                        ? 'bg-red-950/80 border-red-500/80 text-red-400 animate-pulse'
                        : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                    }`}>
                      <AlertTriangle size={15} />
                    </div>
                  </div>
                  <div className={`text-2xl font-serif font-black mb-1 ${
                    (queueStats?.dlq?.failed || 0) > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {queueStats?.dlq?.failed || 0}
                    <span className="text-xs font-normal text-gold-muted ml-1.5">lỗi cần duyệt</span>
                  </div>
                  <div className="text-[11px] text-paper-light/70 font-serif">
                    Đã khắc phục: {queueStats?.dlq?.resolved || 0} • Bỏ qua: {queueStats?.dlq?.discarded || 0}
                  </div>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="p-4 rounded-xl border border-gold-ancient/25 bg-[#170403] flex flex-col md:flex-row items-center justify-between gap-3 shadow">
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  {/* Status Filter */}
                  <select
                    value={dlqStatusFilter}
                    onChange={(e) => {
                      setDlqStatusFilter(e.target.value);
                      setDlqPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#270705] border border-gold-ancient/40 text-xs font-serif text-gold-pale focus:outline-none focus:border-gold-bright"
                  >
                    <option value="all">Mọi trạng thái ({queueStats?.dlq?.total || 0})</option>
                    <option value="failed">Thất bại ({queueStats?.dlq?.failed || 0})</option>
                    <option value="retrying">Đang thử lại ({queueStats?.dlq?.retrying || 0})</option>
                    <option value="resolved">Đã giải quyết ({queueStats?.dlq?.resolved || 0})</option>
                    <option value="discarded">Đã bỏ qua ({queueStats?.dlq?.discarded || 0})</option>
                  </select>

                  {/* Job Type Filter */}
                  <select
                    value={dlqTypeFilter}
                    onChange={(e) => {
                      setDlqTypeFilter(e.target.value);
                      setDlqPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#270705] border border-gold-ancient/40 text-xs font-serif text-gold-pale focus:outline-none focus:border-gold-bright"
                  >
                    <option value="all">Mọi loại tác vụ</option>
                    <option value="DRAW_FORTUNE">Bốc Quẻ (DRAW_FORTUNE)</option>
                    <option value="AI_GENERATION">Luận Quẻ AI (AI_GENERATION)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={handleRetryAll}
                    disabled={loading || (queueStats?.dlq?.failed || 0) === 0}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#551010] border border-gold-bright/60 hover:brightness-110 disabled:opacity-40 text-paper-light text-xs font-serif font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <RotateCcw size={13} />
                    <span>Thử lại tất cả</span>
                  </button>

                  <button
                    onClick={() => fetchDLQJobs(dlqPage)}
                    className="px-3 py-1.5 rounded-lg bg-[#270705] border border-gold-ancient/40 hover:border-gold-bright text-gold-pale text-xs font-serif flex items-center gap-1.5 transition"
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin text-gold-bright" : ""} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* DLQ Failed Jobs List */}
              <div className="space-y-3">
                {dlqJobsData.jobs && dlqJobsData.jobs.length > 0 ? (
                  dlqJobsData.jobs.map((job) => {
                    const isExpanded = expandedJobId === job.id;
                    const payloadObj = typeof job.payload === 'string' ? JSON.parse(job.payload || '{}') : (job.payload || {});

                    let statusBadgeClass = 'bg-red-950/80 border-red-500 text-red-300';
                    let statusLabel = 'Thất bại';
                    if (job.status === 'resolved') {
                      statusBadgeClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                      statusLabel = 'Đã giải quyết';
                    } else if (job.status === 'retrying') {
                      statusBadgeClass = 'bg-amber-950/80 border-amber-500 text-amber-300';
                      statusLabel = 'Đang thử lại';
                    } else if (job.status === 'discarded') {
                      statusBadgeClass = 'bg-zinc-900 border-zinc-600 text-zinc-400';
                      statusLabel = 'Đã bỏ qua';
                    }

                    return (
                      <div
                        key={job.id}
                        className="p-4 rounded-xl bg-[#1C0504]/90 border border-gold-ancient/25 hover:border-gold-bright/50 transition shadow space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#3F0F0D] border border-gold-bright/40 text-[10px] font-mono font-bold text-gold-bright">
                              #{job.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#2B0A26] border border-pink-500/50 text-[10px] font-mono font-bold text-pink-300">
                              {job.job_type}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-serif font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                              {statusLabel}
                            </span>
                            <span className="text-xs font-serif text-paper-light/75">
                              User: <strong className="text-gold-pale">{job.user_id || 'Khách vãng lai'}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-serif">
                            <span className="text-[11px] text-gold-muted font-mono">
                              Thử lại: {job.retry_count}/{job.max_retries}
                            </span>
                            <span className="text-gold-ancient/40">•</span>
                            <span className="text-[11px] text-gold-muted font-mono">
                              {new Date(job.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {/* Error Message Box */}
                        <div className="p-2.5 rounded-lg bg-[#140302] border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                          <div className="break-all">{job.error_message}</div>
                        </div>

                        {/* Actions and Toggle Payload */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="text-xs font-serif text-gold-ancient hover:text-gold-bright flex items-center gap-1 transition"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem Payload & Stack Trace'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {(job.status === 'failed' || job.status === 'retrying') && (
                              <>
                                <button
                                  onClick={() => handleRetryJob(job.id)}
                                  disabled={loading}
                                  className="px-2.5 py-1 rounded bg-gradient-to-r from-[#6E1B1B] to-[#942626] border border-gold-bright/60 text-paper-light text-xs font-serif hover:brightness-110 transition flex items-center gap-1"
                                >
                                  <RotateCcw size={12} />
                                  <span>Thử lại ngay</span>
                                </button>
                                <button
                                  onClick={() => handleDiscardJob(job.id)}
                                  disabled={loading}
                                  className="px-2.5 py-1 rounded bg-[#2A0806] border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-serif hover:bg-red-950/50 transition flex items-center gap-1"
                                >
                                  <Trash2 size={12} />
                                  <span>Bỏ qua</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expanded Payload & Stack Trace */}
                        {isExpanded && (
                          <div className="mt-3 p-3 rounded-lg bg-[#0C0202] border border-gold-ancient/20 space-y-2 text-xs font-mono animate-fadeIn">
                            <div>
                              <span className="text-gold-bright text-[11px] uppercase tracking-wider block mb-1">Payload Dữ Liệu:</span>
                              <pre className="p-2 rounded bg-black/50 text-gold-pale/90 overflow-x-auto text-[11px]">
                                {JSON.stringify(payloadObj, null, 2)}
                              </pre>
                            </div>
                            {job.error_stack && (
                              <div>
                                <span className="text-red-400 text-[11px] uppercase tracking-wider block mb-1">Error Stack Trace:</span>
                                <pre className="p-2 rounded bg-black/50 text-red-300/80 overflow-x-auto text-[10px]">
                                  {job.error_stack}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center rounded-xl bg-[#170403]/60 border border-gold-ancient/20 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-gold-pale">Hàng Đợi Hoàn Hảo!</h3>
                    <p className="text-xs font-serif text-paper-light/60 max-w-sm mx-auto">
                      Không có tác vụ nào bị lỗi hoặc tồn đọng trong Dead Letter Queue (DLQ). Hệ thống đền thờ đang vận hành thông suốt.
                    </p>
                  </div>
                )}
              </div>

              {/* DLQ Pagination */}
              {dlqJobsData.totalPages > 1 && (
                <div className="px-4 py-3 rounded-xl border border-gold-ancient/20 bg-[#140302] flex items-center justify-between text-xs font-serif text-gold-pale">
                  <span>
                    Trang {dlqJobsData.page} / {dlqJobsData.totalPages} (Tổng {dlqJobsData.total} tác vụ)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      disabled={dlqJobsData.page <= 1}
                      onClick={() => setDlqPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                    >
                      Trước
                    </button>
                    <button
                      disabled={dlqJobsData.page >= dlqJobsData.totalPages}
                      onClick={() => setDlqPage(p => p + 1)}
                      className="px-2.5 py-1 rounded border border-gold-ancient/30 disabled:opacity-30 hover:border-gold-bright"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
