import { useState, useEffect } from "react";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [view, setView] = useState("overview"); // overview, users, financials, platform
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const [statsRes, usersRes] = await Promise.all([
        API.get("/dashboard/admin/stats/"),
        API.get("/verify-users/")
      ]);
      setStats(statsRes.data);
      
      const userData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []);
      setUsers(userData);
    } catch (error) {
      console.error("CRITICAL: Dashboard Sync Failure", error);
      setErrorStatus(error.response?.status || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (id) => {
    try {
      await API.post(`/verify-users/${id}/toggle_active/`);
      fetchData();
    } catch (error) {
      showToast("Failed to update user status", "error");
    }
  };

  const toggleUserVerification = async (id, status) => {
    try {
      await API.patch(`/verify-users/${id}/`, { is_verified: !status });
      fetchData();
    } catch (error) {
      showToast("Verification update failed", "error");
    }
  };

  const toggleUserFlag = async (id) => {
    try {
      await API.post(`/verify-users/${id}/toggle_flag/`);
      fetchData();
    } catch (error) {
      showToast("Flag update failed", "error");
    }
  };

  const AreaChart = ({ data, width = 600, height = 200 }) => {
    if (!data || data.length === 0) return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        No platform income data yet.
      </div>
    );
    const max = Math.max(...data.map(d => d.amount), 1);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d.amount / max) * height}`).join(" ");
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPoints} fill="url(#areaGrad)" />
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - (d.amount / max) * height} r="4" fill="#6366f1" />
        ))}
      </svg>
    );
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (u.username || "").toLowerCase().includes(searchLower);
    const emailMatch = (u.email || "").toLowerCase().includes(searchLower);
    const roleMatch = (u.role || "").toLowerCase().includes(searchLower);
    return nameMatch || emailMatch || roleMatch;
  }) : [];

  if (loading) return (
    <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617' }}>
      <div className="loader"></div>
      <h2 style={{ color: '#94a3b8', marginLeft: '20px', fontFamily: 'Inter, sans-serif' }}>Initializing Command Centre...</h2>
    </div>
  );

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#0b1222', borderRight: '1px solid #1e293b', padding: '30px 20px', position: 'sticky', top: 0, height: '100vh' }}>
        <h2 className="text-gradient" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '40px', textAlign: 'center', letterSpacing: '2px' }}>TALENT LINK</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'overview', icon: '📊', label: 'Network Pulse' },
            { id: 'users', icon: '👥', label: 'User Hub' },
            { id: 'financials', icon: '💰', label: 'Financials' },
            { id: 'platform', icon: '🌐', label: 'System Health' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px',
                borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: view === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: view === item.id ? '#818cf8' : '#94a3b8',
                fontWeight: '600', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '6px' }}>
              {view === 'overview' ? 'Global Oversight' : view === 'users' ? 'Registered Talent & Clients' : view === 'financials' ? 'Financial Audit' : 'Platform Health'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time platform synchronization active.</p>
          </div>
          <button className="primary-btn" style={{ padding: '10px 24px', borderRadius: '12px' }} onClick={fetchData}>Refresh Data</button>
        </header>

        {errorStatus && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '12px', marginBottom: '30px', color: '#f87171' }}>
            <h4 style={{ margin: 0 }}>System Alert: {errorStatus === 403 ? 'Access Denied' : 'Sync Failure'}</h4>
          </div>
        )}

        {/* OVERVIEW VIEW */}
        {view === 'overview' && (
          <div className="dashboard-grid" style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              {[
                { label: 'Platform Revenue', value: `$${(stats?.total_revenue || 0).toLocaleString()}`, change: '+18.4%', color: '#10b981', icon: '📈' },
                { label: 'Active Users', value: stats?.total_users || 0, change: '+5.2%', color: '#6366f1', icon: '👥' },
                { label: 'Active Projects', value: stats?.total_projects || 0, change: '+12%', color: '#f59e0b', icon: '💼' },
                { label: 'Success Rate', value: `${(((stats?.completed_contracts || 0) / (stats?.total_projects || 1)) * 100).toFixed(1)}%`, change: '+2.1%', color: '#ec4899', icon: '✨' }
              ].map((card, i) => (
                <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid #1e293b', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px' }}>{card.icon}</span>
                    <span style={{ color: card.color, fontSize: '12px', fontWeight: '700', padding: '4px 8px', background: `${card.color}15`, borderRadius: '6px' }}>{card.change}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>{card.label}</p>
                  <h2 style={{ fontSize: '32px', fontWeight: '800' }}>{card.value}</h2>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px', border: '1px solid #1e293b' }}>
                <h3 style={{ marginBottom: '25px', color: '#f8fafc', fontSize: '20px', fontWeight: '700' }}>Income Growth Cycle</h3>
                <div style={{ height: '260px' }}>
                  <AreaChart data={stats?.income_data} />
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px', border: '1px solid #1e293b' }}>
                <h3 style={{ marginBottom: '25px', fontSize: '20px', fontWeight: '700' }}>Real-time Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {stats?.recent_events?.map((event, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1', marginTop: '6px' }}></div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{event.title}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{event.description} • {event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {view === 'users' && (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px', border: '1px solid #1e293b', animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="glass-input"
                style={{ width: '450px', padding: '14px 20px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px' }}>
                  <th style={{ padding: '0 20px' }}>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ background: 'rgba(30, 41, 59, 0.2)' }}>
                    <td style={{ padding: '20px', borderRadius: '16px 0 0 16px' }}>{user.username}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>{user.is_active ? '✅ Active' : '🔒 Locked'}</td>
                    <td style={{ textAlign: 'right', paddingRight: '20px', borderRadius: '0 16px 16px 0' }}>
                      <button className="glass-btn small" onClick={() => toggleUserActive(user.id)}>
                        {user.is_active ? 'Restrict' : 'Unseal'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FINANCIALS VIEW */}
        {view === 'financials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '32px', border: '1px solid #1e293b' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Total Platform Revenue</p>
                <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#10b981' }}>${stats?.financial_stats?.total_revenue?.toLocaleString()}</h2>
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <p style={{ fontSize: '14px', color: '#10b981' }}>Est. Platform Fee (10%): <strong>${(stats?.financial_stats?.total_revenue * 0.1).toLocaleString()}</strong></p>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '32px', border: '1px solid #1e293b' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Financial Breakdown</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Avg. Project Value</span>
                    <span style={{ fontWeight: '700' }}>${stats?.financial_stats?.avg_transaction_value?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Panding Payouts</span>
                    <span style={{ fontWeight: '700' }}>${stats?.financial_stats?.pending_payments?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Processed Payouts</span>
                    <span style={{ fontWeight: '700' }}>${stats?.financial_stats?.payouts_processed?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Revenue Distribution</h3>
              <div style={{ height: '300px' }}>
                 <AreaChart data={stats?.income_data} height={300} />
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM HEALTH VIEW */}
        {view === 'platform' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', animation: "fadeIn 0.5s ease" }}>
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Core Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>API Server</span>
                  <span style={{ padding: '6px 12px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800' }}>{stats?.system_health?.api_status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Database Cluster</span>
                  <span style={{ padding: '6px 12px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800' }}>{stats?.system_health?.database}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Load Balancer</span>
                  <span style={{ padding: '6px 12px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800' }}>ONLINE</span>
                </div>
              </div>
              <div style={{ marginTop: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <p style={{ fontSize: '13px', color: '#818cf8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>System Uptime</span>
                  <strong>{stats?.system_health?.uptime}</strong>
                </p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Performance Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>API Latency</span>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{stats?.system_health?.latency}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ width: '42%', height: '100%', background: '#6366f1', borderRadius: '3px' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>Active Sessions (24h)</span>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{stats?.system_health?.active_sessions}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ width: '65%', height: '100%', background: '#a855f7', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .text-gradient { background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); }
        .glass-input { background: #0b1222; border: 1px solid #1e293b; color: #f8fafc; border-radius: 14px; outline: none; }
        .glass-btn { background: rgba(30, 41, 59, 0.5); border: 1px solid #1e293b; color: #94a3b8; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .glass-btn.small { padding: 6px 14px; font-size: 11px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
