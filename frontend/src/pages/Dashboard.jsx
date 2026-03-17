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
    recent_activities: []
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

  const getStatusStyle = (status) => {
    if (status === "active") return { color: "#3b82f6", fontWeight: "bold" };
    if (status === "completed") return { color: "#10b981", fontWeight: "bold" };
    return { color: "#f59e0b", fontWeight: "bold" };
  };

  return (
    <div className="page-container" style={{ maxWidth: "1200px", margin: "20px auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
          <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>Here's what's happening with your account today.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/profile")} className="primary-btn" style={{ marginTop: 0 }}>My Profile</button>
          <button onClick={handleLogout} className="btn-cancel" style={{ marginTop: 0 }}>Logout</button>
        </div>
      </header>

      {/* Overview Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="panel-card" style={{ textAlign: "center", padding: "25px" }}>
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "15px" }}>
            {role === "client" ? "Total Spent" : "Total Earnings"}
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#10b981" }}>${stats.total_spent_or_earned}</p>
        </div>
        <div className="panel-card" style={{ textAlign: "center", padding: "25px" }}>
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "15px" }}>Active Contracts</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#3b82f6" }}>{stats.active_contracts}</p>
        </div>
        <div className="panel-card" style={{ textAlign: "center", padding: "25px" }}>
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "15px" }}>
            {role === "client" ? "My Projects" : "Applied Proposals"}
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#f59e0b" }}>
            {role === "client" ? stats.total_projects : stats.pending_proposals}
          </p>
        </div>
        <div className="panel-card" style={{ textAlign: "center", padding: "25px" }}>
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "15px" }}>Avg Rating</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#fbbf24" }}>★ {stats.avg_rating || "0.0"}</p>
        </div>
      </div>

      {/* Main Dashboard Content Tabs */}
      <div className="panel-card" style={{ padding: "0" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #1e293b" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{ padding: "15px 25px", background: "none", border: "none", borderBottom: activeTab === "overview" ? "2px solid #3b82f6" : "none", color: activeTab === "overview" ? "#3b82f6" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}
          >
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            style={{ padding: "15px 25px", background: "none", border: "none", borderBottom: activeTab === "activity" ? "2px solid #3b82f6" : "none", color: activeTab === "activity" ? "#3b82f6" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}
          >
            Recent Activity
          </button>
        </div>

        <div style={{ padding: "30px" }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {role === "client" ? (
                <>
                  <button onClick={() => navigate("/projects/create")} className="primary-btn" style={{ marginTop: 0, padding: "15px 30px" }}>Post a New Project</button>
                  <button onClick={() => navigate("/projects")} className="primary-btn" style={{ marginTop: 0, background: "#1e293b", padding: "15px 30px" }}>Manage My Projects</button>
                  <button onClick={() => navigate("/contracts")} className="primary-btn" style={{ marginTop: 0, background: "#1e293b", padding: "15px 30px" }}>View Active Contracts</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/projects")} className="primary-btn" style={{ marginTop: 0, padding: "15px 30px" }}>Find Work / Browse Projects</button>
                  <button onClick={() => navigate("/contracts")} className="primary-btn" style={{ marginTop: 0, background: "#1e293b", padding: "15px 30px" }}>My Active Contracts</button>
                </>
              )}
              {role === "admin" && (
                <button onClick={() => navigate("/admin")} className="primary-btn" style={{ marginTop: 0, background: "#ef4444", padding: "15px 30px" }}>Go to Admin Core</button>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              {stats.recent_activities && stats.recent_activities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {stats.recent_activities.map((activity) => (
                    <div key={activity.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "8px", background: "#1e293b" }}>
                      <div>
                        <h4 style={{ margin: 0 }}>Contract #{activity.id}</h4>
                        <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#94a3b8" }}>
                          Created on: {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={getStatusStyle(activity.status)}>{activity.status.toUpperCase()}</span>
                        <button 
                          onClick={() => navigate(`/contracts/${activity.id}`)} 
                          className="btn-secondary" 
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>
                  <p>No new activity to show. Start a project or submit a proposal to see updates here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
