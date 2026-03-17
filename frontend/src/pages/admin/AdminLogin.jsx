import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!email.endsWith("@admin.com")) {
            setError("Unauthorized access point. Specialized admin credentials required.");
            return;
        }

        setLoading(true);
        try {
            const response = await loginUser({ username: email, password });
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("role", "admin");
            localStorage.setItem("user_id", response.data.user_id);
            navigate("/admin");
        } catch (err) {
            setError("Login failed. Please verify your administrative credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper" style={{ background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)" }}>
            <div className="auth-card glass-panel" style={{ maxWidth: "400px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 className="text-gradient" style={{ fontSize: "24px", marginBottom: "8px" }}>TalentLink Admin</h1>
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>Administrative Command Centre Access</p>
                </div>

                {error && (
                    <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "12px", marginBottom: "20px" }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleAdminLogin}>
                    <div className="input-group">
                        <label>Admin ID</label>
                        <div className="input-container">
                            <input 
                                type="email" 
                                placeholder="name@admin.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Secure Key</label>
                        <div className="input-container">
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: "20px" }}>
                        {loading ? "Authenticating..." : "Establish Secure Session"}
                    </button>
                </form>

                <p style={{ marginTop: "30px", fontSize: "11px", color: "#475569", textAlign: "center" }}>
                    This system is restricted to authorized personnel only. 
                    Unauthorized access attempts are monitored and logged.
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;
