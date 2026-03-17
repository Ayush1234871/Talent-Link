import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function NavBar() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "freelancer";
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await API.get("/notifications/");
                setNotifications(res.data);
            } catch (err) { /* ignore */ }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/login");
    };

    const markAsRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}/mark_read/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#fff' }}><h2>TalentLink</h2></Link>
            </div>
            <div className="navbar-links">
                {role === "client" && <Link to="/projects/create">Post Project</Link>}
                <Link to="/projects">Projects</Link>
                <Link to="/contracts">Contracts</Link>
                <Link to="/profile">Profile</Link>
                {role === "admin" && <Link to="/admin">Admin</Link>}

                <div className="notification-bell" style={{ position: "relative" }}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className="btn-icon" style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer", position: "relative" }}>
                        🔔 {unreadCount > 0 && <span className="badge" style={{ position: "absolute", top: "-5px", right: "-10px", background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "12px", fontWeight: "bold" }}>{unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu notification-dropdown" style={{ position: "absolute", right: 0, top: "40px", width: "300px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "15px", zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                            <h4 style={{ marginBottom: "10px", color: "#f1f5f9" }}>Notifications</h4>
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {notifications.length === 0 ? <p style={{ color: "#94a3b8" }}>No notifications.</p> : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`notification-item ${!n.is_read ? "unread" : ""}`} style={{ padding: "10px", borderBottom: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "8px", background: n.is_read ? "transparent" : "#1e293b", borderRadius: "4px", marginBottom: "5px" }}>
                                            <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0" }}>{n.message}</p>
                                            {!n.is_read && <button onClick={() => markAsRead(n.id)} style={{ alignSelf: "flex-end", padding: "4px 8px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Mark read</button>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleLogout} className="btn-danger" style={{ padding: "6px 12px", fontSize: "14px", marginLeft: "10px" }}>Logout</button>
            </div>
        </nav>
    );
}

export default NavBar;
