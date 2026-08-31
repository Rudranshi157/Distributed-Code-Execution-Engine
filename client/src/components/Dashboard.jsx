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
    try{
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3000/api/submissions", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        const data = await response.json();
        if (!response.ok) {
        throw new Error(data.message || "Failed to fetch submissions");
        }
        setSubmissions(data.submissions);
    }catch(error){
        console.error("Error fetching submissions:", error);
        setError(error.message);
    }finally{
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

    if(lastMessage.type === "submission-updated"){
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

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);

  const startIndex = (currentPage - 1) * submissionsPerPage;

  const currentPageSubmissions = filteredSubmissions.slice(
    startIndex,
    startIndex + submissionsPerPage,
  );

  return (
    <>
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        <p>Welcome to your Code Runner Dashboard.</p>

        <section className="dashboard-section">
          <h2>Statistics</h2>

          <div className="stats-grid">
            <div className="stat-card">
                <h3>Total Submissions</h3>
                <p>{totalSubmissions}</p>
            </div>

            <div className="stat-card">
                <h3>Completed</h3>
                <p>{completedSubmissions}</p>
            </div>

            <div className="stat-card">
                <h3>Failed</h3>
                <p>{failedSubmissions}</p>
            </div>

            <div className="stat-card">
                <h3>Success Rate</h3>
                <p>{successRate}%</p>
            </div>

            <div className="stat-card">
                <h3>Most Used Language</h3>
                <p>{mostUsedLanguage}</p>
            </div>

            <div className="stat-card">
                <h3>Avg. Execution Time</h3>
                <p>{averageExecutionTime} ms</p>
            </div>
        </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Submissions</h2>
          <div className="filters-container">
            <SubmissionFilters
                languageFilter={languageFilter}
                setLanguageFilter={setLanguageFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
        </div>

          {loading ? (
                <p>Loading submissions...</p>
           ) : error ? (
                <p>{error}</p>
             ) : submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : filteredSubmissions.length === 0 ? (
            <p>No submissions match the selected filters.</p>
          ) : (
            <div className="table-container">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Execution Time</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {currentPageSubmissions.map((submission) => (
                  <tr
                    className="submission-row"
                    key={submission._id}
                    onClick={() =>
                      navigate(`/dashboard/submission/${submission._id}`, {
                        state: { submission },
                      })
                    }
                  >
                    <td>{submission.language}</td>
                    <td>
                      <StatusBadge status={submission.status} />
                    </td>
                    <td>{submission.executionTime} ms</td>
                    <td>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {filteredSubmissions.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default Dashboard;
