import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import "./Dashboard.css";

function SubmissionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/submissions/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch submission"
                    );
                }

                setSubmission(data.submission);

            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [id]);

    if (loading) {
        return (
            <div className="dc-page">
                <div className="dc-state-message">
                    <span className="dc-spinner" />
                    Loading submission...
                </div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="dc-page">
                <div className="dc-detail-notfound">
                    <span className="material-symbols-outlined">
                        search_off
                    </span>

                    <h1>Submission Not Found</h1>

                    <button
                        className="dc-page-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isProblemSubmission = !!submission.problemId;

    return (
        <div className="dc-page">

            <button
                className="dc-page-btn dc-detail-back"
                onClick={() => navigate("/dashboard")}
            >
                <span className="material-symbols-outlined">
                    arrow_back
                </span>
                Back to Dashboard
            </button>

            {/* Header */}
            <header className="dc-topbar dc-detail-header">

                <div className="dc-topbar-title">

                    <span className="material-symbols-outlined dc-topbar-icon">
                        receipt_long
                    </span>

                    <div>
                        <h1>Submission Details</h1>

                        <p className="dc-subtitle">
                            {new Date(
                                submission.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>

                </div>
                <StatusBadge status={submission.status} />
                <StatusBadge status={submission.verdict} />

            </header>


            {/* Submission Type / Problem */}
            <section className="dc-section">

                <div className="dc-detail-meta-grid">

                    {/* Type */}
                    <div className="dc-stat-card">

                        <div className="dc-stat-icon dc-accent-primary">
                            <span className="material-symbols-outlined">
                                {isProblemSubmission
                                    ? "assignment"
                                    : "terminal"}
                            </span>
                        </div>

                        <div className="dc-stat-body">

                            <h3>Type</h3>

                            <p>
                                {isProblemSubmission
                                    ? "Problem Submission"
                                    : "Custom Execution"}
                            </p>

                        </div>

                    </div>


                    {/* Problem */}
                    {isProblemSubmission && (
                        <div className="dc-stat-card">

                            <div className="dc-stat-icon dc-accent-secondary">
                                <span className="material-symbols-outlined">
                                    code
                                </span>
                            </div>

                            <div className="dc-stat-body">

                                <h3>Problem</h3>

                                <p>
                                    {submission.problemId.title}
                                </p>

                            </div>

                        </div>
                    )}


                    {/* Language */}
                    <div className="dc-stat-card">

                        <div className="dc-stat-icon dc-accent-secondary">
                            <span className="material-symbols-outlined">
                                code
                            </span>
                        </div>

                        <div className="dc-stat-body">

                            <h3>Language</h3>

                            <p>
                                {submission.language}
                            </p>

                        </div>

                    </div>


                    {/* Execution Time */}
                    <div className="dc-stat-card">

                        <div className="dc-stat-icon dc-accent-primary">
                            <span className="material-symbols-outlined">
                                speed
                            </span>
                        </div>

                        <div className="dc-stat-body">

                            <h3>Execution Time</h3>

                            <p>
                                {submission.executionTime} ms
                            </p>

                        </div>

                    </div>


                    {/* Date */}
                    <div className="dc-stat-card">

                        <div className="dc-stat-icon dc-accent-tertiary">
                            <span className="material-symbols-outlined">
                                calendar_today
                            </span>
                        </div>

                        <div className="dc-stat-body">

                            <h3>Date</h3>

                            <p>
                                {new Date(
                                    submission.createdAt
                                ).toLocaleDateString()}
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* Code */}
            <section className="dc-section">

                <h2 className="dc-section-title">
                    Code
                </h2>

                <pre className="dc-code-block">
                    {submission.code}
                </pre>

            </section>


            {/* Input */}
            <section className="dc-section">

                <h2 className="dc-section-title">
                    Input
                </h2>

                <pre className="dc-code-block">
                    {submission.input || "No input"}
                </pre>

            </section>


            {/* Output */}
            <section className="dc-section">

                <h2 className="dc-section-title">
                    Output
                </h2>

                <pre className="dc-code-block">
                    {submission.output || submission.error || submission.verdict}
                </pre>

            </section>


            {/* Error */}
            {submission.error && (
                <section className="dc-section">

                    <h2 className="dc-section-title">
                        Error
                    </h2>

                    <pre className="dc-code-block dc-code-block-error">
                        {submission.error}
                    </pre>

                </section>
            )}

        </div>
    );
}

export default SubmissionDetails;
