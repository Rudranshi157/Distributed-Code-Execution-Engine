import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import "./Dashboard.css";
import SubmissionFilters from "./SubmissionFilters";

function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const submissionsPerPage = 10;
  const navigate = useNavigate();
  const { lastMessage } = useWebSocket();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    console.log("Dashboard received:", lastMessage);

    if (lastMessage.type === "submission-updated") {
      fetchSubmissions();
    }
  }, [lastMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [languageFilter, statusFilter]);

  const totalSubmissions = submissions.length;

  const completedSubmissions = submissions.filter(
    (submission) => submission.status === "completed",
  ).length;

  const failedSubmissions = submissions.filter(
    (submission) => submission.status === "failed",
  ).length;

  const successRate =
    totalSubmissions === 0
      ? 0
      : Math.round((completedSubmissions / totalSubmissions) * 100);

  const languageCounts = {};

  submissions.forEach((submission) => {
    const language = submission.language;

    languageCounts[language] = (languageCounts[language] || 0) + 1;
  });

  const maxLanguageCount = Math.max(0, ...Object.values(languageCounts));

  const mostUsedLanguages = Object.keys(languageCounts).filter(
    (language) => languageCounts[language] === maxLanguageCount,
  );

  const mostUsedLanguage =
    submissions.length === 0 ? "None" : mostUsedLanguages.join(", ");

  const totalExecutionTime = submissions.reduce(
    (total, submission) => total + (submission.executionTime || 0),
    0,
  );

  const averageExecutionTime =
    totalSubmissions === 0
      ? 0
      : Math.round(totalExecutionTime / totalSubmissions);

  const filteredSubmissions = submissions.filter((submission) => {
    const languageMatches =
      languageFilter === "all" || submission.language === languageFilter;

    const statusMatches =
      statusFilter === "all" || submission.status === statusFilter;

    return languageMatches && statusMatches;
  });

  const totalPages = Math.ceil(
    filteredSubmissions.length / submissionsPerPage,
  );

  const startIndex = (currentPage - 1) * submissionsPerPage;

  const currentPageSubmissions = filteredSubmissions.slice(
    startIndex,
    startIndex + submissionsPerPage,
  );

  const STAT_CARDS = [
    {
      label: "Total Submissions",
      value: totalSubmissions,
      icon: "inventory_2",
      accent: "primary",
    },
    {
      label: "Completed",
      value: completedSubmissions,
      description: "(Execution completed successfully)",
      icon: "check_circle",
      accent: "secondary",
    },
    {
      label: "Failed",
      value: failedSubmissions,
      description: "(Backend execution failed)",
      icon: "cancel",
      accent: "error",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      description: "Backend execution success rate, not code correctness",
      icon: "trending_up",
      accent: "primary",
    },
    {
      label: "Most Used Language",
      value: mostUsedLanguage,
      icon: "code",
      accent: "tertiary",
    },
    {
      label: "Avg. Execution Time",
      value: `${averageExecutionTime} ms`,
      icon: "speed",
      accent: "secondary",
    },
  ];

  return (
    <div className="dc-page">
      <header className="dc-topbar">
        <div className="dc-topbar-title">
          <span className="material-symbols-outlined dc-topbar-icon">
            dashboard
          </span>

          <div>
            <h1>Dashboard</h1>

            <p className="dc-subtitle">
              Welcome to your Code Runner Dashboard.
            </p>
          </div>
        </div>

        <div className="dc-live-chip">
          <span className="dc-live-dot" />
          Live updates
        </div>
      </header>

      <section className="dc-section">
        <h2 className="dc-section-title">Statistics</h2>

        <div className="dc-stats-grid">
          {STAT_CARDS.map((card) => (
            <div className="dc-stat-card" key={card.label}>
              <div className={`dc-stat-icon dc-accent-${card.accent}`}>
                <span className="material-symbols-outlined">
                  {card.icon}
                </span>
              </div>

              <div className="dc-stat-body">
                <h3>{card.label}</h3>

                <p>{card.value}</p>

                {card.description && (
                  <span className="dc-stat-description">
                    {card.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dc-section">
        <div className="dc-section-header">
          <div>
            <h2 className="dc-section-title">Recent Submissions</h2>

            <p className="dc-section-description">
              Status shows backend processing state. Verdict indicates code
              correctness for problem submissions.
            </p>
          </div>

          <div className="dc-filters-container">
            <SubmissionFilters
              languageFilter={languageFilter}
              setLanguageFilter={setLanguageFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>
        </div>

        {loading ? (
          <div className="dc-state-message">
            <span className="dc-spinner" />
            Loading submissions...
          </div>
        ) : error ? (
          <div className="dc-state-message dc-state-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : submissions.length === 0 ? (
          <div className="dc-state-message">
            No submissions yet.
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="dc-state-message">
            No submissions match the selected filters.
          </div>
        ) : (
          <div className="dc-table-container">
            <table className="dc-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Verdict</th>
                  <th>Execution Time</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {currentPageSubmissions.map((submission) => (
                  <tr
                    className="dc-row"
                    key={submission._id}
                    onClick={() =>
                      navigate(
                        `/dashboard/submission/${submission._id}`,
                        {
                          state: { submission },
                        },
                      )
                    }
                  >
                    <td>
                      <span className="dc-lang-pill">
                        {submission.language}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={submission.status} />
                    </td>
                    <td>
                      <StatusBadge status={submission.verdict} />
                    </td>

                    <td className="dc-mono">
                      {submission.executionTime} ms
                    </td>

                    <td className="dc-mono">
                      {new Date(
                        submission.createdAt,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredSubmissions.length > 0 && (
          <div className="dc-pagination">
            <button
              className="dc-page-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">
                chevron_left
              </span>
              Previous
            </button>

            <span className="dc-page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="dc-page-btn dc-page-btn-primary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next

              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
