import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ProjectFeed() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "freelancer";
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/projects/")
            .then((res) => {
                setProjects(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching projects:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="page-container" style={{ maxWidth: "800px", margin: "50px auto" }}>
                <h2 className="loading-shimmer" style={{ width: "200px", height: "30px", marginBottom: "20px" }}></h2>
                {[1, 2, 3].map(i => (
                    <div key={i} className="panel-card loading-shimmer" style={{ height: "150px", marginBottom: "15px" }}></div>
                ))}
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h2 style={{ fontSize: "28px", margin: 0 }}>Available Opportunities</h2>
                    <p style={{ color: "#94a3b8", marginTop: "5px" }}>Discover projects that match your expertise.</p>
                </div>
                <button onClick={() => navigate("/projects/create")} className="primary-btn" style={{ marginTop: 0 }}>
                    Post a Project
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
                {projects.length === 0 ? (
                    <div className="panel-card" style={{ textAlign: "center", padding: "60px", gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: "50px", marginBottom: "20px" }}>🔍</div>
                        <h3>No projects found</h3>
                        <p style={{ color: "#94a3b8" }}>Check back later or post your own project to get started.</p>
                    </div>
                ) : (
                    projects.map((proj) => (
                        <div key={proj.id} className="panel-card project-card" style={{ transition: "transform 0.2s", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <h3 style={{ margin: 0, color: "#3b82f6" }}>{proj.title}</h3>
                                <span style={{ padding: "4px 12px", background: "#1e293b", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", color: "#10b981", whiteSpace: "nowrap", marginLeft: "10px" }}>
                                    ${proj.budget}
                                </span>
                            </div>

                            <p style={{ margin: "15px 0", color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6", flex: 1 }}>
                                {proj.description.length > 200 ? proj.description.substring(0, 200) + "..." : proj.description}
                            </p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                                {proj.skills.split(",").map((skill, idx) => (
                                    <span key={idx} style={{ padding: "2px 10px", background: "#1e293b", borderRadius: "12px", fontSize: "11px", color: "#94a3b8" }}>
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "15px", marginTop: "auto" }}>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>
                                    🕒 Duration: {proj.duration} days
                                </span>
                                <button
                                    className="primary-btn"
                                    onClick={() => navigate(`/projects/${proj.id}`)}
                                    style={{ marginTop: 0, padding: "8px 20px", fontSize: "14px" }}
                                >
                                    {role === "client" ? "View" : "View & Apply"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProjectFeed;
