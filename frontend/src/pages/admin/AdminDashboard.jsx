import { useState, useEffect } from "react";
import API from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [view, setView] = useState("overview"); // overview, users, reports
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
      console.log("Dashboard Sync Success:", { stats: statsRes.data, usersCount: usersRes.data.length });
      
      setStats(statsRes.data);
      
      // 🛡️ Handle DRF pagination if present
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
      alert("Failed to update user status");
    }
  };

  const toggleUserVerification = async (id, status) => {
    try {
      await API.patch(`/verify-users/${id}/`, { is_verified: !status });
      fetchData();
    } catch (error) {
      alert("Verification update failed");
    }
  };

  const toggleUserFlag = async (id) => {
    try {
      await API.post(`/verify-users/${id}/toggle_flag/`);
      fetchData();
    } catch (error) {
      alert("Flag update failed");
    }
  };

  // 📈 Advanced Chart Components
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
    const nameMatch = u.username?.toLowerCase().includes(searchLower);
    const emailMatch = u.email?.toLowerCase().includes(searchLower);
    const roleMatch = u.role?.toLowerCase().includes(searchLower);
    const profileMatch = u.profile?.bio?.toLowerCase().includes(searchLower) || u.profile?.skills?.toLowerCase().includes(searchLower);
    
    return nameMatch || emailMatch || roleMatch || profileMatch;
  }) : [];

  if (loading) return (
    <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617' }}>
      <div className="loader"></div>
      <h2 style={{ color: '#94a3b8', marginLeft: '20px', fontFamily: 'Inter, sans-serif' }}>Initializing Command Centre...</h2>
    </div>
  );

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* 🏰 High-End Sidebar */}
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
                boxShadow: view === item.id ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 🚀 Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '6px' }}>
              {view === 'overview' ? 'Global Oversight' : view === 'users' ? 'Registered Talent & Clients' : 'Detailed Analysis'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time platform synchronization active.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '8px 16px', borderRadius: '30px', border: '1px solid #1e293b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>CORE SECURE</span>
            </div>
            <button className="primary-btn" style={{ padding: '10px 24px', borderRadius: '12px' }} onClick={fetchData}>Refresh Data</button>
          </div>
        </header>

        {errorStatus && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '12px', marginBottom: '30px', color: '#f87171' }}>
            <h4 style={{ margin: 0 }}>System Alert: {errorStatus === 403 ? 'Access Denied' : 'Sync Failure'}</h4>
            <p style={{ fontSize: '13px', margin: '5px 0 0' }}>
              {errorStatus === 403 ? 'Your session lacks the required administrator clearance. Please logout and login via the Admin Gateway.' : `The command centre could not synchronize with the platform core (Error: ${errorStatus}).`}
            </p>
          </div>
        )}

        {view === 'overview' && (
          <div className="dashboard-grid">
            {/* Stats Overview */}
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

            {/* Charts Section */}
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
                  {stats?.recent_events?.length > 0 ? stats.recent_events.map((event, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1', marginTop: '6px', boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)' }}></div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{event.title}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{event.description} • {event.time}</p>
                      </div>
                    </div>
                  )) : <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>No recent events logged.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Master search: users, roles, verify status..." 
                  className="glass-input"
                  style={{ width: '450px', padding: '14px 20px 14px 45px', fontSize: '14px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="glass-btn">Export Directory</button>
                <button className="glass-btn primary" style={{ background: '#6366f1', color: 'white', borderColor: 'transparent' }}>Audit Review</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '0 20px' }}>User Identity</th>
                    <th>Role & Profile</th>
                    <th>Engagement</th>
                    <th>Security</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Governance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <tr key={user.id} style={{ background: 'rgba(30, 41, 59, 0.2)', transition: '0.2s', borderRadius: '16px' }}>
                      <td style={{ padding: '20px', borderRadius: '16px 0 0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#6366f1', border: '1px solid #1e293b' }}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '15px' }}>{user.username} {user.is_flagged && <span style={{ color: '#ef4444' }}>🚩</span>}</p>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>{user.email || 'No email registered'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                            {user.profile?.bio && <span style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.profile.bio}</span>}
                        </div>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                        <p>{new Date(user.date_joined).toLocaleDateString()}</p>
                        {user.profile?.hourly_rate && <p style={{ fontSize: '11px', color: '#10b981' }}>${user.profile.hourly_rate}/hr</p>}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', background: user.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.is_active ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
                          {user.is_active ? 'Active' : 'Locked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px', borderRadius: '0 16px 16px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            className="glass-btn small" 
                            onClick={() => toggleUserVerification(user.id, user.is_verified)}
                            style={{ borderColor: user.is_verified ? '#10b981' : '#6366f1', color: user.is_verified ? '#10b981' : '#6366f1' }}
                          >
                            {user.is_verified ? 'Verified' : 'Verify'}
                          </button>
                          <button 
                            className="glass-btn small danger" 
                            onClick={() => toggleUserActive(user.id)}
                            style={{ borderColor: user.is_active ? '#ef4444' : '#10b981', color: user.is_active ? '#ef4444' : '#10b981' }}
                          >
                            {user.is_active ? 'Restrict' : 'Unseal'}
                          </button>
                          <button 
                             className="glass-btn small"
                             onClick={() => toggleUserFlag(user.id)}
                             style={{ background: user.is_flagged ? '#ef4444' : 'transparent', color: user.is_flagged ? 'white' : '#94a3b8' }}
                          >
                            Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>No users match the control criteria.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .role-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          display: inline-block;
          width: fit-content;
        }
        .role-badge.client { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
        .role-badge.freelancer { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-badge.admin { background: rgba(236, 72, 153, 0.1); color: #f472b6; }
        
        .glass-btn {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          color: #94a3b8;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          transition: 0.2s;
          font-weight: 600;
        }
        .glass-btn:hover { background: #1e293b; color: #f8fafc; transform: translateY(-1px); }
        .glass-btn.small { padding: 6px 14px; font-size: 11px; }
        .glass-btn.danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; }
        
        .glass-input {
          background: #0b1222;
          border: 1px solid #1e293b;
          color: #f8fafc;
          border-radius: 14px;
          outline: none;
          transition: 0.2s;
        }
        .glass-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        
        .text-gradient {
          background: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        button:active { transform: scale(0.96); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
