import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "Client",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check again.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: formData.username,
        password: formData.password,
        role: formData.role.toLowerCase()
      });
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Register failed:", error);
      const serverMsg = error.response?.data?.username?.[0] || error.response?.data?.detail;
      setError(serverMsg || "Registration failed. Username may already be taken or server is offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="subtitle">Join the TalentLink community today</p>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "10px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder="e.g. creative_mind"
                value={formData.username}
                onChange={handleChange}
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
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-container">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Verify password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>I want to join as a:</label>
            <div className="input-container">
              <select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
                <option value="Client">Client (Hire talent)</option>
                <option value="Freelancer">Freelancer (Find work)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
