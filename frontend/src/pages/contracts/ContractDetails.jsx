import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

function ContractDetails() {
    const { id } = useParams();
    const role = localStorage.getItem("role") || "freelancer";
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [contract, setContract] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [review, setReview] = useState({ rating: 0, comment: "" });
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContractData = async () => {
            try {
                const conRes = await API.get(`/contracts/${id}/`);
                setContract(conRes.data);

                const msgRes = await API.get(`/messages/?contract=${id}`);
                setMessages(msgRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching contract data:", err);
                setLoading(false);
            }
        };
        fetchContractData();

        // Polling for new messages every 5 seconds (Simple "live" chat for demo)
        const interval = setInterval(async () => {
            try {
                const msgRes = await API.get(`/messages/?contract=${id}`);
                setMessages(msgRes.data);
            } catch (err) { /* ignore */ }
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await API.post("/messages/", {
                contract: id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleAction = async (action) => {
        if (action === "Mark Completed") {
            try {
                await API.patch(`/contracts/${id}/update_status/`, { status: "completed" });
                setContract({ ...contract, status: "completed" });
                showToast("Contract marked as Completed!");
            } catch (err) {
                console.error("Error updating status:", err);
            }
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await API.post("/reviews/", {
                contract: id,
                rating: review.rating,
                comment: review.comment
            });
            showToast("Review submitted successfully!");
            navigate("/contracts");
        } catch (err) {
            console.error("Error submitting review:", err);
            showToast("Failed to submit review. You can only review once.", "error");
        }
    };

    if (loading) return <div className="page-container"><h2>Loading contract...</h2></div>;
    if (!contract) return <div className="page-container"><h2>Contract not found.</h2></div>;

    const otherPartyLabel = role === "client" ? `Freelancer ID: ${contract.freelancer}` : `Client ID: ${contract.client}`;

    return (
        <div className="page-container" style={{ margin: "0 auto", padding: "10px" }}>
            <button onClick={() => navigate("/contracts")} className="btn-cancel" style={{ marginBottom: "20px" }}>&larr; Back to Contracts</button>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {/* LHS: Contract details */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div className="panel-card" style={{ maxWidth: "100%", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h2 style={{ fontSize: "22px", margin: 0 }}>Contract #{id}</h2>
                            <span style={{ padding: "4px 8px", background: contract.status === "completed" ? "#064e3b" : "#1e3a8a", color: "white", borderRadius: "4px", fontSize: "14px", textTransform: "capitalize" }}>{contract.status}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                            <p><strong>{role === "client" ? "Freelancer" : "Client"}:</strong> {otherPartyLabel}</p>
                            <p><strong>Start Date:</strong> {new Date(contract.created_at).toLocaleDateString()}</p>
                            <p style={{ marginTop: "10px", lineHeight: "1.5", background: "#0b1120", padding: "10px", borderRadius: "4px" }}><strong>Terms:</strong><br />{contract.terms}</p>
                        </div>

                        {contract.status === "active" && role === "client" && (
                            <button onClick={() => handleAction("Mark Completed")} className="btn-success" style={{ width: "100%", marginTop: "20px" }}>Mark as Completed</button>
                        )}
                    </div>

                    {/* Review Form (Only show if completed) */}
                    {contract.status === "completed" && (
                        <div className="panel-card" style={{ maxWidth: "100%", padding: "20px", marginTop: "20px" }}>
                            <h3>Leave a Review</h3>
                            <form onSubmit={submitReview} style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Rating</label>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`star ${star <= (hoverRating || review.rating) ? "active" : ""}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setReview({ ...review, rating: star })}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label>Comment</label>
                                    <textarea rows="3" required value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder={`Tell us about your experience...`} style={{ resize: "vertical" }} />
                                </div>
                                <button type="submit" className="primary-btn" disabled={review.rating === 0}>Submit Review</button>
                            </form>
                        </div>
                    )}
                </div>

                {/* RHS: Chat / Messaging Interface */}
                <div style={{ flex: 1, minWidth: "350px" }}>
                    <div className="chat-window" style={{ height: "550px" }}>
                        <div style={{ padding: "15px", borderBottom: "1px solid #1e293b", background: "#0b1120", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "16px" }}>Messaging</h3>
                        </div>

                        <div className="chat-messages" style={{ overflowY: "auto" }}>
                            {messages.length === 0 ? <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "20px" }}>No messages yet. Say hi!</p> : messages.map((m) => (
                                <div key={m.id} className={`chat-message ${m.sender == localStorage.getItem("user_id") ? "self" : "other"}`}>
                                    {m.content}
                                    <span className="timestamp">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>

                        {contract.status === "active" ? (
                            <form onSubmit={handleSendMessage} className="chat-input-area" style={{ borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    required
                                />
                                <button type="submit" className="primary-btn" style={{ marginTop: 0, padding: "10px 16px" }}>Send</button>
                            </form>
                        ) : (
                            <div style={{ padding: "15px", textAlign: "center", background: "#1e293b", color: "#94a3b8", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", fontSize: "14px" }}>
                                Contract is Completed. Chat is closed.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContractDetails;
