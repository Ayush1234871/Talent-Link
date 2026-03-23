import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getClientDashboard, getFreelancerDashboard } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "freelancer";
  const [stats, setStats] = useState({
    total_projects: 0,
    active_contracts: 0,
    total_spent_or_earned: 0,
    pending_proposals: 0,
    avg_rating: 0,
    recent_activities: [],
    chart_data: [],
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = role === "client" ? await getClientDashboard() : await getFreelancerDashboard();
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const AreaChart = ({ data, width = 600, height = 150 }) => {
    if (!data || data.length === 0) return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
        Analyzing activity patterns...
      </div>
    );
    const max = Math.max(...data.map(d => d.amount), 1);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d.amount / max) * height}`).join(" ");
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="userAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPoints} fill="url(#userAreaGrad)" />
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - (d.amount / max) * height} r="3" fill="#6366f1" />
        ))}
      </svg>
    );
  };

  if (loading) return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
      <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ animation: "fadeIn 0.8s ease-out", padding: "40px" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-card:hover { transform: translateY(-5px); border-color: var(--primary); }
        .action-card:hover { background: rgba(99, 102, 241, 0.1); border-color: var(--primary); }
      `}</style>
      
      {/* Header with Hero Profile Snippet */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", minWidth: "300px" }}>
          <div style={{ 
            width: "64px", height: "64px", borderBox: "border-box", flexShrink: 0,
            borderRadius: "18px", 
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: "800", color: "white",
            boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)"
          }}>
            {role[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "900", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              Welcome back, <span className="text-gradient">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>Control Center • Active Sync • {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
          <button onClick={() => navigate("/profile")} className="glass-panel" style={{ padding: "12px 28px", border: "1px solid var(--glass-border)", borderRadius: "12px", cursor: "pointer", color: "white", fontWeight: "700", whiteSpace: "nowrap" }}>👤 Profile</button>
          <button onClick={handleLogout} className="glass-panel" style={{ padding: "12px 28px", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", cursor: "pointer", color: "#f87171", fontWeight: "700", whiteSpace: "nowrap" }}>🚪 Logout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr", gap: "32px" }}>
        
        {/* Left Column: Analytics & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Quick Stats Grid - Explicitly 4 columns on large screens */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "20px" 
          }}>
            {[
              { label: role === "client" ? "Capital Deployed" : "Net Earnings", value: `$${stats.total_spent_or_earned}`, icon: "💰", color: "#10b981" },
              { label: "Active Nodes", value: stats.active_contracts, icon: "⚡", color: "#6366f1" },
              { label: role === "client" ? "Open Projects" : "Proposals Out", value: role === "client" ? stats.total_projects : stats.pending_proposals, icon: "🎯", color: "#f59e0b" },
              { label: "Trust Index", value: stats.avg_rating || "5.0", icon: "⭐", color: "#fbbf24" }
            ].map((s, i) => (
              <div key={i} className="glass-panel stat-card" style={{ padding: "24px", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px" }}>{s.icon}</span>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: s.color, background: `${s.color}15`, padding: "2px 8px", borderRadius: "4px" }}>LIVE</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "800", marginBottom: "4px" }}>{s.label}</p>
                <h2 style={{ fontSize: "28px", fontWeight: "900", margin: 0 }}>{s.value}</h2>
              </div>
            ))}
          </div>

          {/* Activity Graph Section */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Activity Pulsar</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>Financial engagement velocity over last 7 cycles.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "20px", fontWeight: "900", color: "var(--primary)", margin: 0 }}>+{role === 'client' ? 'Velocity' : 'Growth'}</p>
                <p style={{ fontSize: "10px", color: "#10b981", fontWeight: "800" }}>STABLE SIGNAL</p>
              </div>
            </div>
            <div style={{ height: "180px", marginBottom: "16px" }}>
              <AreaChart data={stats.chart_data} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
              {stats.chart_data?.map((d, i) => (
                <span key={i} style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>{d.date}</span>
              ))}
            </div>
          </div>

          {/* Quick Command Center */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px" }}>Command Center</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {role === "client" ? (
                <>
                  <button onClick={() => navigate("/projects/create")} className="glass-panel action-card" style={{ padding: "20px", textAlign: "left", cursor: "pointer", transition: "0.2s" }}>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>🚀 Deploy Project</h4>
                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>Initiate a new milestone in the market.</p>
                  </button>
                  <button onClick={() => navigate("/projects")} className="glass-panel action-card" style={{ padding: "20px", textAlign: "left", cursor: "pointer", transition: "0.2s" }}>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>🛰️ Manage Fleet</h4>
                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>Oversee and optimize your active projects.</p>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/projects")} className="glass-panel action-card" style={{ padding: "20px", textAlign: "left", cursor: "pointer", transition: "0.2s" }}>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>🔍 Scour Market</h4>
                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>Search for high-value project opportunities.</p>
                  </button>
                  <button onClick={() => navigate("/contracts")} className="glass-panel action-card" style={{ padding: "20px", textAlign: "left", cursor: "pointer", transition: "0.2s" }}>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>🛠️ Active Lab</h4>
                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>Continue work on your active contracts.</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini-Dashboard & Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Performance Radar */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>Radar</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
               <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{role === 'client' ? 'Match Accuracy' : 'Success Velocity'}</span>
                    <span style={{ fontSize: "12px", fontWeight: "900" }}>{stats.performance?.match_score || stats.performance?.success_rate || "95%"}</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                    <div style={{ width: "95%", height: "100%", background: "var(--primary)", borderRadius: "2px" }}></div>
                  </div>
               </div>
               <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Efficiency</span>
                    <span style={{ fontSize: "12px", fontWeight: "900" }}>100%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                    <div style={{ width: "100%", height: "100%", background: "#10b981", borderRadius: "2px" }}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="glass-panel" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))" }}>
            <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Target</h3>
            <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "white" }}>Reach 5-Star Elite Status</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Estimated: 2 projects remaining.</p>
            <div style={{ marginTop: "16px", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
               <span style={{ fontSize: "12px", fontWeight: "800", color: "#a5b4fc" }}>VIEW ROADMAP →</span>
            </div>
          </div>

          {/* Recent Event Log */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>Pulse Log</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {stats.recent_activities?.slice(0, 3).map((act) => (
                <div key={act.id} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#3b82f6", marginTop: "4px" }}></div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "700", margin: 0 }}>Contract Updated</p>
                    <p style={{ fontSize: "10px", color: "var(--text-secondary)", margin: 0 }}>ID: #{act.id} • {act.status}</p>
                  </div>
                </div>
              ))}
              {(!stats.recent_activities || stats.recent_activities.length === 0) && (
                <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Listening for signals...</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
