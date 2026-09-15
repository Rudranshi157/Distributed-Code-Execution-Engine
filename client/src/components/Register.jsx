import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Step 1: Register the user
            const registerResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                }
            );

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                setError(registerData.message || "Registration failed");
                setLoading(false);
                return;
            }

            // Step 2: Automatically login the newly registered user
            const loginResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                setError(
                    "Registration successful, but automatic login failed"
                );
                setLoading(false);
                return;
            }

            // Step 3: Store the NEW user's token
            localStorage.setItem("token", loginData.token);

            // Step 4: Go to dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Registration error:", error);
            setError("Unable to connect to server");
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-icon">
                        <span className="material-symbols-outlined">
                            person_add
                        </span>
                    </div>

                    <h1>Create an account</h1>

                    <p className="auth-subtitle">
                        Register to start using DCEE
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>

                    <div className="auth-field">
                        <label htmlFor="username">Username</label>

                        <div className="auth-input-wrap">
                            <span className="material-symbols-outlined">
                                person
                            </span>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>

                        <div className="auth-input-wrap">
                            <span className="material-symbols-outlined">
                                mail
                            </span>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>

                        <div className="auth-input-wrap">
                            <span className="material-symbols-outlined">
                                lock
                            </span>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span className="material-symbols-outlined">
                                error
                            </span>

                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="auth-spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">
                                    person_add
                                </span>
                                Create account
                            </>
                        )}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    );
}

export default Register;