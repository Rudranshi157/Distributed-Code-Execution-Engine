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
                    `http://localhost:3000/api/submissions/${id}`,
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
        return <p>Loading submission...</p>;
    }

    if (!submission) {
        return (
            <div>
                <h1>Submission Not Found</h1>

                <button onClick={() => navigate("/dashboard")}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
            </button>

            <h1>Submission Details</h1>

            <p>
                <strong>Language:</strong> {submission.language}
            </p>

           <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={submission.status} />
            </p>

            <p>
                <strong>Execution Time:</strong>{" "}
                {submission.executionTime} ms
            </p>

            <p>
                <strong>Date:</strong>{" "}
                {new Date(
                    submission.createdAt
                ).toLocaleDateString()}
            </p>

            <section>
                <h2>Code</h2>
                <pre>{submission.code}</pre>
            </section>

            <section>
                <h2>Input</h2>
                <pre>
                    {submission.input || "No input"}
                </pre>
            </section>

            <section>
                <h2>Output</h2>
                <pre>
                    {submission.output || "No output"}
                </pre>
            </section>

            {submission.error && (
                <section>
                    <h2>Error</h2>
                    <pre>{submission.error}</pre>
                </section>
            )}
        </div>
    );
}

export default SubmissionDetails;