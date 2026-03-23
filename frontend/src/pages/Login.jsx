import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ username, password, role });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("user_id", response.data.user_id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.response?.data?.detail || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to continue to TalentLink</p>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "10px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-selector">
            <div
              className={`role-option ${role === "client" ? "active" : ""}`}
              onClick={() => setRole("client")}
            >
              Hire Talent
            </div>
            <div
              className={`role-option ${role === "freelancer" ? "active" : ""}`}
              onClick={() => setRole("freelancer")}
            >
              Find Work
            </div>
          </div>

          <div className="input-group">
            <label>Username</label>
            <div className="input-container">
              <input
                type="text"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-container">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
