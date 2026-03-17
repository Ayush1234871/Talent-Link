import { useState, useEffect } from "react";
import API from "../services/api";

function Profile() {
  const [profileData, setProfileData] = useState({
    bio: "",
    skills: "",
    hourly_rate: "",
    availability: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const role = localStorage.getItem("role") || "freelancer";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profiles/me/");
        const data = response.data;
        setProfileData({
          bio: data.bio || "",
          skills: data.skills || "",
          hourly_rate: data.hourly_rate || "",
          availability: data.availability || "",
        });
        // If profile is brand new, open edit mode automatically
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/profiles/me/", profileData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><h2>Loading Profile...</h2></div>;
  }

  /* ---- VIEW MODE ---- */
  if (!isEditing) {
    return (
      <div className="dashboard-container">
        <div className="panel-card" style={{ maxWidth: "600px", width: "100%" }}>
          {/* Avatar / Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", borderBottom: "1px solid #1e293b", paddingBottom: "24px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: "700", color: "white", flexShrink: 0
            }}>
              {username[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px" }}>{username}</h2>
              <span style={{
                display: "inline-block", marginTop: "6px",
                padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                background: role === "freelancer" ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)",
                color: role === "freelancer" ? "#818cf8" : "#34d399"
              }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {profileData.bio && (
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>About</p>
                <p style={{ color: "#e2e8f0", lineHeight: "1.6" }}>{profileData.bio}</p>
              </div>
            )}
            {profileData.skills && (
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profileData.skills.split(",").map((skill, i) => (
                    <span key={i} style={{ padding: "4px 12px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", fontSize: "13px", color: "#a5b4fc" }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {role === "freelancer" && profileData.hourly_rate && (
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hourly Rate</p>
                <p style={{ color: "#34d399", fontSize: "20px", fontWeight: "700" }}>
                  ${profileData.hourly_rate}<span style={{ fontSize: "14px", color: "#64748b", fontWeight: "400" }}>/hr</span>
                </p>
              </div>
            )}
            {profileData.availability && (
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Availability</p>
                <p style={{ color: "#e2e8f0" }}>🕒 {profileData.availability}</p>
              </div>
            )}
            {!profileData.bio && !profileData.skills && (
              <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>
                Your profile is empty. Click Edit to add your details!
              </p>
            )}
          </div>

          <button
            className="primary-btn"
            onClick={() => setIsEditing(true)}
            style={{ marginTop: "28px" }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>
    );
  }

  /* ---- EDIT MODE ---- */
  return (
    <div className="dashboard-container">
      <div className="panel-card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="form-field">
            <label>Bio / Portfolio Links</label>
            <textarea
              rows="3"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-field">
            <label>Skills</label>
            <input
              type="text"
              value={profileData.skills}
              onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              placeholder="React, Django, Python"
            />
          </div>

          {role === "freelancer" && (
            <div className="form-field">
              <label>Hourly Rate ($)</label>
              <input
                type="number"
                value={profileData.hourly_rate}
                onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                placeholder="50"
              />
            </div>
          )}

          <div className="form-field">
            <label>Availability (hours/week)</label>
            <input
              type="text"
              value={profileData.availability}
              onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
              placeholder="e.g. 20 hours, Full-time"
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button type="submit" className="primary-btn" style={{ flex: 1, marginTop: 0 }} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                flex: 1,
                padding: "16px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
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
