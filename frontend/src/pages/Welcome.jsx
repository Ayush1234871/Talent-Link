import { useNavigate } from "react-router-dom";

function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="hero-wrapper">
            <div className="hero-background"></div>
            <div className="hero-gradient-overlay"></div>

            <div className="hero-content">
                <div className="hero-text-container">
                    <h1 className="hero-title">
                        Connect with <span className="text-gradient">Top Talent</span>
                    </h1>
                    <p className="hero-subtitle">
                        The premier platform for finding extraordinary freelancers.
                        Build your team, manage contracts, and deliver projects faster.
                    </p>

                    <div className="hero-buttons">
                        <button className="primary-btn" onClick={() => navigate("/register")}>
                            Get Started
                        </button>
                        <button className="btn-secondary" onClick={() => navigate("/login")}>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>

            <section className="landing-section">
                <h2 className="section-title">Why TalentLink?</h2>
                <p className="section-desc">
                    TalentLink is the ultimate destination where top companies find elite freelance
                    talent. Whether you are looking to hire a professional for your next big project
                    or seeking high-paying freelance opportunities, TalentLink provides the tools
                    you need to succeed safely and efficiently.
                </p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Fast Hiring</h3>
                        <p>Browse through hundreds of verified freelance profiles and hire the perfect match in record time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💼</div>
                        <h3>Secure Contracts</h3>
                        <p>Our milestone-based contract system ensures that both clients and freelancers are protected.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Real-time Chat</h3>
                        <p>Communicate seamlessly with your clients or hires through our built-in instant messaging platform.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Welcome;
