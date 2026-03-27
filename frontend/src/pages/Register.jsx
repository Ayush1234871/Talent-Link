import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      showToast("Registration successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Register failed:", error);
      
      let errorMsg = "Registration failed. Please try again.";
      
      if (!error.response) {
        // Network error (server is offline or unreachable)
        errorMsg = "Server is unreachable. Please check if the backend is running.";
      } else if (error.status === 400 || error.response?.status === 400) {
        // Specific validation errors from backend
        const data = error.response?.data;
        if (data?.username) {
          errorMsg = data.username[0];
        } else if (data?.detail) {
          errorMsg = data.detail;
        } else {
          errorMsg = "Invalid details provided. Please check your username and password.";
        }
      } else if (error.response) {
        errorMsg = `Server error (${error.response.status}). Please try again later.`;
      }
      
      setError(errorMsg);
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
