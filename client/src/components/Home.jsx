import { useNavigate } from "react-router-dom";
import "./Home.css";

const ARCHITECTURE_STEPS = [
    { icon: "person", title: "User", desc: "Submits source code and execution requests." },
    { icon: "dns", title: "Express API", desc: "Receives requests and manages authentication and submissions." },
    { icon: "layers", title: "BullMQ Queue", desc: "Distributes execution jobs through Redis and BullMQ." },
    { icon: "memory", title: "Worker", desc: "Processes jobs asynchronously." },
    { icon: "deployed_code", title: "Docker Sandbox", desc: "Runs code in an isolated and resource-limited environment." },
    { icon: "task_alt", title: "Execution Result", desc: "Returns execution status, output, verdict, and execution time." },
];

const FEATURES = [
    {
        icon: "code",
        title: "Multi-Language Execution",
        desc: "Run code in Python, JavaScript, Java, and C++.",
    },
    {
        icon: "security",
        title: "Secure Sandboxing",
        desc: "Code executes inside isolated Docker containers with restricted resources and no network access.",
    },
    {
        icon: "layers",
        title: "Queue-Based Processing",
        desc: "BullMQ and Redis handle execution jobs asynchronously at scale.",
    },
    {
        icon: "checklist",
        title: "Automated Judging",
        desc: "Public and hidden test cases with verdicts: Accepted, Wrong Answer, Runtime Error, Compilation Error, TLE, and Output Limit Exceeded.",
    },
    {
        icon: "bolt",
        title: "Real-Time Updates",
        desc: "WebSockets stream live execution and job status updates as they happen.",
    },
    {
        icon: "shield",
        title: "Load Protection",
        desc: "Queue backpressure, concurrency control, and retry handling keep the system stable under load.",
    },
];

const TECH_STACK = [
    { category: "Frontend", items: ["React", "Vite", "Monaco Editor"] },
    { category: "Backend", items: ["Node.js", "Express"] },
    { category: "Infrastructure", items: ["Redis", "BullMQ", "Docker", "WebSockets"] },
    { category: "Database", items: ["MongoDB"] },
];

const SECURITY_CONTROLS = [
    { icon: "speed", label: "CPU limits" },
    { icon: "memory", label: "Memory limits" },
    { icon: "account_tree", label: "Process limits" },
    { icon: "wifi_off", label: "Network disabled" },
    { icon: "lock", label: "Read-only filesystem" },
    { icon: "folder_open", label: "Temporary filesystem for /tmp" },
    { icon: "timer_off", label: "Execution timeout" },
    { icon: "unfold_less", label: "Output size limits" },
];

function isLoggedIn() {
    return !!localStorage.getItem("token");
}

function Home() {
    const navigate = useNavigate();

    const goToRunnerOrLogin = () => {
        navigate(isLoggedIn() ? "/runner" : "/login");
    };

    return (
        <div className="home-page">

            {/* HERO */}
            <section className="home-hero">
                <span className="home-eyebrow">Distributed Systems · Code Execution</span>
                <h1 className="home-hero-title">Distributed Code Execution Engine</h1>
                <p className="home-hero-tagline">Write. Run. Test. Judge.</p>
                <p className="home-hero-desc">
                    Execute code in isolated Docker environments with queue-based processing and real-time execution updates.
                </p>

                <ul className="home-hero-points">
                    <li><span className="material-symbols-outlined">layers</span>Distributed job processing</li>
                    <li><span className="material-symbols-outlined">security</span>Secure sandboxed execution</li>
                    <li><span className="material-symbols-outlined">dns</span>Queue-based architecture</li>
                    <li><span className="material-symbols-outlined">bolt</span>Real-time execution updates</li>
                    <li><span className="material-symbols-outlined">checklist</span>Automated judging</li>
                </ul>

                <div className="home-hero-actions">
                    <button className="dc-page-btn dc-page-btn-primary" onClick={goToRunnerOrLogin}>
                        Get Started
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <button className="dc-page-btn" onClick={goToRunnerOrLogin}>
                        Explore Code Runner
                    </button>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="home-section">
                <h2 className="dc-section-title">How It Works</h2>
                <div className="home-flow">
                    {ARCHITECTURE_STEPS.map((step, i) => (
                        <div className="home-flow-item" key={step.title}>
                            <div className="home-flow-card">
                                <div className="dc-stat-icon dc-accent-primary">
                                    <span className="material-symbols-outlined">{step.icon}</span>
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                            {i < ARCHITECTURE_STEPS.length - 1 && (
                                <span className="material-symbols-outlined home-flow-arrow">arrow_forward</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section className="home-section">
                <h2 className="dc-section-title">Built for Reliable Code Execution</h2>
                <div className="home-features-grid">
                    {FEATURES.map((feature) => (
                        <div className="dc-stat-card home-feature-card" key={feature.title}>
                            <div className="dc-stat-icon dc-accent-secondary">
                                <span className="material-symbols-outlined">{feature.icon}</span>
                            </div>
                            <div className="dc-stat-body">
                                <h3 className="home-feature-title">{feature.title}</h3>
                                <p className="home-feature-desc">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TECH STACK */}
            <section className="home-section">
                <h2 className="dc-section-title">Technology Stack</h2>
                <div className="home-stack-grid">
                    {TECH_STACK.map((group) => (
                        <div className="home-stack-group" key={group.category}>
                            <span className="home-stack-label">{group.category}</span>
                            <div className="home-stack-badges">
                                {group.items.map((item) => (
                                    <span className="dc-lang-pill" key={item}>{item}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECURITY */}
            <section className="home-section">
                <h2 className="dc-section-title">Isolated Execution Environment</h2>
                <p className="home-security-intro">
                    Every submission runs inside a locked-down Docker container:
                </p>
                <div className="home-security-grid">
                    {SECURITY_CONTROLS.map((control) => (
                        <div className="home-security-item" key={control.label}>
                            <span className="material-symbols-outlined">{control.icon}</span>
                            {control.label}
                        </div>
                    ))}
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="home-final-cta">
                <h2>Ready to run your code?</h2>
                <p>Open the Code Runner and submit your first execution.</p>
                <button className="dc-page-btn dc-page-btn-primary" onClick={goToRunnerOrLogin}>
                    Open Code Runner
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </section>

        </div>
    );
}

export default Home;