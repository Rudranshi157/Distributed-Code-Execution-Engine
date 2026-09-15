import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);

            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setError("Unable to connect to server");
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <span className="material-symbols-outlined">terminal</span>
                    </div>
                    <h1>Welcome back</h1>
                    <p className="auth-subtitle">Log in to continue to your dashboard.</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>

                        <div className="auth-input-wrap">
                            <span className="material-symbols-outlined">mail</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>

                        <div className="auth-input-wrap">
                            <span className="material-symbols-outlined">lock</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;