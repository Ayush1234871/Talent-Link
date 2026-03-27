import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

function ProjectDetails() {
    const { id } = useParams();
    const role = localStorage.getItem("role") || "freelancer";
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [project, setProject] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [proposalDetails, setProposalDetails] = useState({ bid_amount: "", duration: "", cover_letter: "" });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const projRes = await API.get(`/projects/${id}/`);
                setProject(projRes.data);

                if (role === "client") {
                    const propRes = await API.get(`/proposals/?project=${id}`);
                    setProposals(propRes.data.filter(p => p.project == id));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching details:", err);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, role]);

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post("/proposals/", {
                project: id,
                ...proposalDetails
            });
            showToast("Proposal submitted successfully!");
            setProposalDetails({ bid_amount: "", duration: "", cover_letter: "" });
        } catch (err) {
            console.error("Error submitting proposal:", err);
            showToast("Failed to submit proposal. Make sure you are a freelancer.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (proposalId, action) => {
        if (action === "accepted") {
            if (!window.confirm(`Accept this proposal and create a contract?`)) return;

            try {
                const res = await API.post(`/proposals/${proposalId}/accept/`);
                showToast(res.data.message || "Proposal accepted!");
                navigate("/contracts");
            } catch (err) {
                console.error("Error accepting proposal:", err);
                showToast("Failed to accept proposal.", "error");
            }
        } else {
            if (!window.confirm("Are you sure you want to reject this proposal?")) return;
            try {
                await API.post(`/proposals/${proposalId}/reject/`);
                setProposals(proposals.filter(p => p.id !== proposalId));
            } catch (err) {
                console.error("Error rejecting proposal:", err);
            }
        }
    };

    if (loading) return <div className="page-container"><h2>Loading details...</h2></div>;
    if (!project) return (
        <div className="page-container" style={{ textAlign: "center", padding: "100px" }}>
            <h2>Project not found.</h2>
            <button onClick={() => navigate("/projects")} className="primary-btn">Back to Projects</button>
        </div>
    );

    return (
        <div className="page-container" style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
            <button onClick={() => navigate("/projects")} className="btn-cancel" style={{ marginBottom: "30px", padding: "8px 15px", display: "flex", alignItems: "center", gap: "5px" }}>
                <span>&larr;</span> Back to Opportunities
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    {/* Project Main Info */}
                    <div className="panel-card" style={{ padding: "30px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "28px", margin: 0, color: "#3b82f6" }}>{project.title}</h2>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 style={{ color: "#94a3b8", marginBottom: "10px", fontSize: "14px", textTransform: "uppercase" }}>Project Description</h4>
                        <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#e2e8f0", whiteSpace: "pre-line" }}>
                            {project.description}
                        </p>
                    </div>

                    {/* Proposals Section */}
                    {role === "client" && (
                        <div className="panel-card">
                            <h3 style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                Received Proposals
                                <span style={{ fontSize: "14px", background: "#1e293b", padding: "2px 10px", borderRadius: "10px", color: "#3b82f6" }}>{proposals.length}</span>
                            </h3>
                            {proposals.length === 0 ? <p style={{ color: "#94a3b8" }}>No proposals yet for this project.</p> : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {proposals.map(p => (
                                        <div key={p.id} className="list-item" style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "20px" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                                    <strong style={{ color: "#3b82f6" }}>Freelancer #{p.freelancer}</strong>
                                                    <span style={{ fontWeight: "bold", color: "#10b981" }}>${p.bid_amount}</span>
                                                </div>
                                                <p style={{ margin: "10px 0", fontSize: "14px", color: "#94a3b8", fontStyle: "italic", background: "#1e293b", padding: "10px", borderRadius: "6px" }}>
                                                    "{p.cover_letter}"
                                                </p>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>⏱ Delivery: {p.duration} days</div>
                                            </div>
                                            <div className="btn-group" style={{ marginTop: "15px", borderTop: "1px solid #1e293b", paddingTop: "15px" }}>
                                                {p.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => handleAction(p.id, "accepted")} className="primary-btn" style={{ padding: "8px 20px", marginTop: 0, background: "#10b981" }}>Hire Now</button>
                                                        <button onClick={() => handleAction(p.id, "rejected")} className="btn-cancel" style={{ padding: "8px 20px", marginTop: 0 }}>Decline</button>
                                                    </>
                                                ) : (
                                                    <span style={{ color: p.status === 'accepted' ? "#10b981" : "#ef4444", fontWeight: "bold", textTransform: "uppercase", fontSize: "12px" }}>• {p.status}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <aside style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    {/* Project Sidebar Stats */}
                    <div className="panel-card" style={{ padding: "25px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>Estimated Budget</label>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff" }}>${project.budget}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>Timeframe</label>
                                <div style={{ fontSize: "18px" }}>{project.duration} Days</div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>Work Skills</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                                    {project.skills.split(",").map((s, idx) => (
                                        <span key={idx} style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px" }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proposal Form Sidebar */}
                    {role === "freelancer" && (
                        <div className="panel-card" style={{ border: "1px solid #3b82f6" }}>
                            <h3>Apply for Gig</h3>
                            <form onSubmit={handleProposalSubmit} style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                <div className="form-field">
                                    <label>Your Bid ($)</label>
                                    <input type="number" value={proposalDetails.bid_amount} onChange={e => setProposalDetails({ ...proposalDetails, bid_amount: e.target.value })} required disabled={submitting} />
                                </div>
                                <div className="form-field">
                                    <label>Duration (Days)</label>
                                    <input type="number" value={proposalDetails.duration} onChange={e => setProposalDetails({ ...proposalDetails, duration: e.target.value })} required disabled={submitting} />
                                </div>
                                <div className="form-field">
                                    <label>Pitch</label>
                                    <textarea rows="4" value={proposalDetails.cover_letter} onChange={e => setProposalDetails({ ...proposalDetails, cover_letter: e.target.value })} required placeholder="Why are you the best for this project?" disabled={submitting} style={{ fontSize: "14px" }} />
                                </div>
                                <button type="submit" className="primary-btn" disabled={submitting} style={{ marginTop: "10px" }}>
                                    {submitting ? "Sending..." : "Send Proposal"}
                                </button>
                            </form>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default ProjectDetails;
