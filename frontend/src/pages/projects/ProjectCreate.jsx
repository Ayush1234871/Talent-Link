import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ProjectCreate() {
    const navigate = useNavigate();
    const [project, setProject] = useState({
        title: "",
        description: "",
        skills: "",
        budget: "",
        duration: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (parseFloat(project.budget) <= 0) {
            setError("Budget must be a positive number.");
            return;
        }

        setLoading(true);
        try {
            await API.post("/projects/", project);
            alert("Project posted successfully!");
            navigate("/projects");
        } catch (err) {
            console.error("Error creating project:", err);
            setError("Failed to create project. Please ensure you are logged in as a Client.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="panel-card" style={{ maxWidth: "600px", margin: "50px auto", padding: "30px" }}>
                <h2 style={{ marginBottom: "10px" }}>Post a Project</h2>
                <p style={{ color: "#94a3b8", marginBottom: "25px" }}>Describe your requirements to find the best freelancers.</p>

                {error && (
                    <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fecaca" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="form-field">
                        <label>Project Title</label>
                        <input
                            type="text"
                            value={project.title}
                            onChange={e => setProject({ ...project, title: e.target.value })}
                            required
                            placeholder="e.g. Build a Landing Page for my SaaS"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-field">
                        <label>Detailed Description</label>
                        <textarea
                            rows="5"
                            value={project.description}
                            onChange={e => setProject({ ...project, description: e.target.value })}
                            required
                            style={{ resize: "vertical" }}
                            placeholder="Explain the scope, deliverables, and timeline..."
                            disabled={loading}
                        />
                    </div>
                    <div className="form-field">
                        <label>Required Skills</label>
                        <input
                            type="text"
                            value={project.skills}
                            onChange={e => setProject({ ...project, skills: e.target.value })}
                            required
                            placeholder="e.g. React, Node.js, UI Design"
                            disabled={loading}
                        />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div className="form-field">
                            <label>Budget ($)</label>
                            <input
                                type="number"
                                value={project.budget}
                                onChange={e => setProject({ ...project, budget: e.target.value })}
                                required
                                placeholder="500"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-field">
                            <label>Duration (days)</label>
                            <input
                                type="number"
                                value={project.duration}
                                onChange={e => setProject({ ...project, duration: e.target.value })}
                                required
                                placeholder="14"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button type="submit" className="primary-btn" style={{ flex: 2 }} disabled={loading}>
                            {loading ? "Posting..." : "Post Project Now"}
                        </button>
                        <button type="button" onClick={() => navigate("/dashboard")} className="btn-cancel" style={{ flex: 1 }} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProjectCreate;
