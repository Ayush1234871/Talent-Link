import { useState, useEffect } from "react";
import API from "../services/api";

function Profile() {
  const [profileData, setProfileData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    skills: "",
    hourly_rate: "",
    availability: "",
    location: "",
    profile_picture: "",
    phone_number: "",
    portfolio_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [username, setUsername] = useState("User");
  const role = localStorage.getItem("role") || "freelancer";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profiles/me/");
        const data = response.data;
        setProfileData({
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          skills: data.skills || "",
          hourly_rate: data.hourly_rate || "",
          availability: data.availability || "",
          location: data.location || "",
          profile_picture: data.profile_picture || "",
          phone_number: data.phone_number || "",
          portfolio_url: data.portfolio_url || "",
        });
        setUsername(data.user_details?.username || "User");
        
        if (!data.bio && !data.skills) {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateProfileStrength = () => {
    const fields = ['bio', 'skills', 'profile_picture', 'portfolio_url', 'location', 'phone_number'];
    const filled = fields.filter(f => !!profileData[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const validate = () => {
    const newErrors = {};
    if (!profileData.email) newErrors.email = "Email is required";
    if (!profileData.first_name) newErrors.first_name = "First name is required";
    if (!profileData.bio) newErrors.bio = "About section is required";
    if (!profileData.skills) newErrors.skills = "Skills are required";
    if (role === "freelancer" && !profileData.hourly_rate) newErrors.hourly_rate = "Hourly rate is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      await API.put("/profiles/me/", profileData);
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ animation: "fadeIn 1s ease" }}>
        <div className="glass-panel" style={{ padding: "60px", textAlign: "center", border: "none" }}>
          <div className="loading-spinner" style={{ 
            width: "50px", height: "50px", border: "4px solid rgba(99, 102, 241, 0.1)", 
            borderTop: "4px solid var(--primary)", borderRadius: "50%", margin: "0 auto 20px",
            animation: "spin 1s linear infinite"
          }}></div>
          <h2 className="text-gradient" style={{ letterSpacing: "2px" }}>DIMENSIONING PROFILE...</h2>
        </div>
      </div>
    );
  }

  const strength = calculateProfileStrength();

  /* ---- VIEW MODE ---- */
  if (!isEditing) {
    return (
      <div className="dashboard-container" style={{ animation: "fadeIn 0.8s ease-out" }}>
        <style>
          {`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .stat-card:hover { transform: translateY(-5px); border-color: var(--primary) !important; background: rgba(99, 102, 241, 0.05) !important; }
            .skill-badge:hover { transform: scale(1.05); background: rgba(99, 102, 241, 0.2) !important; }
          `}
        </style>
        
        <div style={{ maxWidth: "1000px", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Hero Banner Card */}
          <div className="glass-panel" style={{ padding: "0", overflow: "hidden", position: "relative" }}>
            <div style={{ 
              height: "160px", 
              background: "linear-gradient(135deg, var(--bg-dark), var(--primary), var(--accent))", 
              opacity: "0.8",
              position: "relative"
            }}>
              {/* Profile Strength Indicator */}
              <div style={{ 
                position: "absolute", bottom: "20px", right: "20px", 
                background: "rgba(0,0,0,0.5)", padding: "10px 16px", borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)"
              }}>
                <p style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", fontWeight: "800" }}>Profile Strength</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "100px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${strength}%`, height: "100%", background: "var(--primary)", transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "white" }}>{strength}%</span>
                </div>
              </div>
            </div>

            <div style={{ padding: "0 40px 40px", marginTop: "-60px", display: "flex", alignItems: "flex-end", gap: "32px", position: "relative" }}>
              <div style={{ position: "relative" }}>
                {profileData.profile_picture ? (
                  <img 
                    src={profileData.profile_picture} 
                    alt="Profile" 
                    style={{ width: "150px", height: "150px", borderRadius: "32px", objectFit: "cover", border: "6px solid var(--bg-darker)", boxShadow: "0 15px 35px rgba(0,0,0,0.5)" }}
                  />
                ) : (
                  <div style={{
                    width: "150px", height: "150px", borderRadius: "32px",
                    background: "linear-gradient(135deg, var(--primary), var(--accent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "64px", fontWeight: "800", color: "white",
                    border: "6px solid var(--bg-darker)", boxShadow: "0 15px 35px rgba(99, 102, 241, 0.3)"
                  }}>
                    {profileData.first_name[0]?.toUpperCase() || username[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: "10px", right: "-15px",
                  background: role === "freelancer" ? "#6366f1" : "#10b981",
                  color: "white", padding: "6px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "800",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)", border: "2px solid var(--bg-darker)"
                }}>
                  {role.toUpperCase()}
                </div>
              </div>

              <div style={{ flex: 1, paddingBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h1 style={{ fontSize: "36px", fontWeight: "900", color: "white", margin: 0, letterSpacing: "-0.5px" }}>
                      {profileData.first_name} {profileData.last_name || ""}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "18px", margin: "4px 0 0" }}>@{username}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="primary-btn" 
                    style={{ marginTop: 0, padding: "12px 28px", borderRadius: "14px", boxShadow: "0 10px 20px rgba(99,102,241,0.2)" }}
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "24px" }}>
            
            {/* Sidebar Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Contact Card */}
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>Connect</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px" }}>📧</span>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Email</p>
                      <p style={{ fontSize: "14px", color: "white", fontWeight: "600", margin: 0, wordBreak: "break-all" }}>{profileData.email}</p>
                    </div>
                  </div>
                  {profileData.phone_number && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "20px" }}>📱</span>
                      <div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Phone</p>
                        <p style={{ fontSize: "14px", color: "white", fontWeight: "600", margin: 0 }}>{profileData.phone_number}</p>
                      </div>
                    </div>
                  )}
                  {profileData.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "20px" }}>📍</span>
                      <div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Location</p>
                        <p style={{ fontSize: "14px", color: "white", fontWeight: "600", margin: 0 }}>{profileData.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Link */}
              {profileData.portfolio_url && (
                <a 
                  href={profileData.portfolio_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="glass-panel" 
                  style={{ 
                    padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", 
                    gap: "12px", textDecoration: "none", transition: "all 0.3s ease",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
                    border: "1px solid rgba(99, 102, 241, 0.3)"
                  }}
                >
                  <span style={{ fontSize: "20px" }}>🔗</span>
                  <span style={{ fontWeight: "700", color: "#a5b4fc", fontSize: "15px" }}>Professional Portfolio</span>
                </a>
              )}
            </div>

            {/* Main Content Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Quick Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
                {role === "freelancer" && (
                  <div className="glass-panel stat-card" style={{ padding: "20px", textAlign: "center", transition: "all 0.3s ease" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "800", marginBottom: "8px" }}>Rate</p>
                    <p style={{ fontSize: "24px", fontWeight: "900", color: "#10b981", margin: 0 }}>${profileData.hourly_rate}<span style={{ fontSize: "14px", color: "#64748b" }}>/hr</span></p>
                  </div>
                )}
                <div className="glass-panel stat-card" style={{ padding: "20px", textAlign: "center", transition: "all 0.3s ease" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "800", marginBottom: "8px" }}>Availability</p>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "#fbbf24", margin: 0 }}>{profileData.availability || "Open"}</p>
                </div>
              </div>

              {/* About Section */}
              <div className="glass-panel" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>Biography</h3>
                <p style={{ fontSize: "16px", color: "#cbd5e1", lineHeight: "1.8", margin: 0 }}>
                  {profileData.bio || "No professional summary added yet."}
                </p>
              </div>

              {/* Skills Section */}
              <div className="glass-panel" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>Core Expertise</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {profileData.skills ? (
                    profileData.skills.split(",").map((skill, i) => (
                      <span 
                        key={i} 
                        className="skill-badge"
                        style={{ 
                          padding: "8px 20px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", 
                          border: "1px solid var(--glass-border)", fontSize: "14px", fontWeight: "600", color: "#e2e8f0",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "#64748b" }}>Start building your skill list...</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /* ---- EDIT MODE ---- */
  return (
    <div className="dashboard-container" style={{ animation: "fadeIn 0.5s ease" }}>
      <div className="glass-panel" style={{ maxWidth: "900px", width: "100%", padding: "48px" }}>
        <h2 className="text-gradient" style={{ fontSize: "40px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-1px" }}>Profile Forge</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "48px", fontSize: "16px" }}>Define your professional presence on TalentLink.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h4 style={{ fontSize: "14px", color: "white", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "24px", height: "24px", background: "var(--primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>1</span>
              Identity Details
            </h4>
            
            <div className="form-field">
              <label>First Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                placeholder="Ex: Alexander"
                style={{ borderColor: errors.first_name ? "#ef4444" : "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
              />
              {errors.first_name && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{errors.first_name}</p>}
            </div>

            <div className="form-field">
              <label>Last Name</label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                placeholder="Ex: Hamilton"
                style={{ background: "rgba(0,0,0,0.2)" }}
              />
            </div>

            <div className="form-field">
              <label>Email Address <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="alex@nexus.com"
                style={{ borderColor: errors.email ? "#ef4444" : "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
              />
              {errors.email && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{errors.email}</p>}
            </div>

            <div className="form-field">
              <label>Handheld Contact</label>
              <input
                type="text"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                placeholder="+1 800-CORE-INT"
                style={{ background: "rgba(0,0,0,0.2)" }}
              />
            </div>

            <div className="form-field">
              <label>Physical/Remote Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="San Francisco, CA"
                style={{ background: "rgba(0,0,0,0.2)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h4 style={{ fontSize: "14px", color: "white", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "24px", height: "24px", background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>2</span>
              Professional Echo
            </h4>

            <div className="form-field">
              <label>Visual Identity (Avatar URL)</label>
              <input
                type="text"
                value={profileData.profile_picture}
                onChange={(e) => setProfileData({ ...profileData, profile_picture: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                style={{ background: "rgba(0,0,0,0.2)" }}
              />
            </div>

            <div className="form-field">
              <label>Professional Narrative <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                rows="5"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Your unique professional fingerprint..."
                style={{ borderColor: errors.bio ? "#ef4444" : "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", borderRadius: "16px" }}
              />
              {errors.bio && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{errors.bio}</p>}
            </div>

            <div className="form-field">
              <label>Technological Spectrum <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text"
                value={profileData.skills}
                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                placeholder="React, AWS, Machine Learning..."
                style={{ borderColor: errors.skills ? "#ef4444" : "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
              />
              {errors.skills && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{errors.skills}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="form-field">
                <label>Weekly Echo</label>
                <input
                  type="text"
                  value={profileData.availability}
                  onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                  placeholder="Full-time"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                />
              </div>

              {role === "freelancer" && (
                <div className="form-field">
                  <label>Service Rate ($) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    value={profileData.hourly_rate}
                    onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                    placeholder="75"
                    style={{ borderColor: errors.hourly_rate ? "#ef4444" : "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
                  />
                  {errors.hourly_rate && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: "600" }}>{errors.hourly_rate}</p>}
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Digital Portfolio</label>
              <input
                type="text"
                value={profileData.portfolio_url}
                onChange={(e) => setProfileData({ ...profileData, portfolio_url: e.target.value })}
                placeholder="https://nexus.dev/profile"
                style={{ background: "rgba(0,0,0,0.2)" }}
              />
            </div>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", gap: "20px", marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "32px" }}>
            <button type="submit" className="primary-btn" style={{ flex: 2, marginTop: 0, padding: "18px" }} disabled={saving}>
              {saving ? "Deploying Updates..." : "✨ Synchronize Profile"}
            </button>
            <button
              type="button"
              onClick={() => { setIsEditing(false); setErrors({}); }}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
