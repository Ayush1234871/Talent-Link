import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ContractList() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "freelancer";
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/contracts/")
            .then((res) => {
                setContracts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching contracts:", err);
                setLoading(false);
            });
    }, []);

    const getStatusStyle = (status) => {
        if (status === "active") return { color: "#3b82f6", fontWeight: "bold" };
        if (status === "completed") return { color: "#10b981", fontWeight: "bold" };
        return { color: "#f59e0b", fontWeight: "bold" };
    };

    if (loading) return <div className="page-container"><h2>Loading contracts...</h2></div>;

    return (
        <div className="page-container" style={{ margin: "20px auto" }}>
            <h2>My Contracts</h2>
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Manage your active and past agreements.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {contracts.length === 0 ? <p style={{ color: "#94a3b8" }}>No contracts found yet.</p> : contracts.map((c) => (
                    <div key={c.id} className="list-item" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => navigate(`/contracts/${c.id}`)}>
                        <div>
                            <h4>Contract #{c.id}</h4>
                            <p><strong>{role === "client" ? "Freelancer ID" : "Client ID"}:</strong> {role === "client" ? c.freelancer : c.client} &nbsp;|&nbsp; <strong>Date:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
                            <p style={{ marginTop: "5px" }}>Status: <span style={getStatusStyle(c.status)}>{c.status.toUpperCase()}</span></p>
                        </div>
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <button className="btn-secondary" style={{ padding: "6px 12px" }}>{c.status === "completed" ? "Completed" : "View details"}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContractList;
