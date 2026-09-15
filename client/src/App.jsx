import { useEffect, useRef, useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";
import { executeCode, submitCode } from "./services/executionApi";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import SubmissionDetails from "./components/SubmissionDetails";
import { useWebSocket } from "./context/WebSocketContext";

function VerdictBadge({ verdict }) {
  const isPass = verdict === "Accepted" || verdict === "AC";
  return (
    <span className={`verdict-badge ${isPass ? "verdict-badge--pass" : "verdict-badge--fail"}`}>
      {verdict}
    </span>
  );
}

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="app-nav">
      <span className="app-nav__brand">Code Runner</span>

      <Link to="/" className="app-nav__link app-nav__link--active">
        Code Runner
      </Link>

      <Link to="/dashboard" className="app-nav__link">
        Dashboard
      </Link>

      <button onClick={handleLogout} className="app-nav__logout">
        <span className="material-symbols-outlined">logout</span>
        Logout
      </button>
    </nav>
  );
}

function App() {
  const [language, setLanguage] = useState("js");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [judgeResult, setJudgeResult] = useState(null);
  const [problemId, setProblemId] = useState("");
  const [problems, setProblems] = useState([]);
  const [mode, setMode] = useState("run");

  const selectedProblem = problems.find(
    (problem) => problem._id === problemId
  );

  const currentJobId = useRef(null);
  const { clientId, lastMessage } = useWebSocket();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`${API_URL}/api/problems`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const data = lastMessage;

    if (String(data.jobId) !== String(currentJobId.current)) {
      return;
    }

    console.log("received", data);

    if (data.status === "active") {
      setStatus("active");
    } else if (data.status === "completed") {
      setStatus(data.result.status);

      if (data.result.verdict) {
        // judge result
        setJudgeResult(data.result);
      } else {
        // run code result
        if (data.result.success) {
          setOutput(data.result.stdout);
        } else {
          setOutput(data.result.stderr || data.result.status);
        }
      }

      setIsRunning(false);
    } else if (data.status === "failed") {
      setStatus(data.status);
      setOutput(data.error);
      setIsRunning(false);
    }
  }, [lastMessage]);

  const runCode = async () => {
    setOutput("");
    setStatus("");
    setIsRunning(true);

    try {
      const jobId = await executeCode(language, code, input, clientId);
      currentJobId.current = jobId;
    } catch (err) {
      console.log(err.message);
      setOutput("Failed to execute code");
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!problemId) {
      setOutput("Please select a problem");
      return;
    }
    if (!code.trim()) {
      setOutput("Please write some code");
      return;
    }

    setOutput("");
    setStatus("");
    setIsRunning(true);
    setJudgeResult(null);

    try {
      const data = await submitCode(problemId, language, code, clientId);

      console.log("Submission created:", data);

      currentJobId.current = data.jobId;
      setStatus("queued");
    } catch (err) {
      console.log(err.message);
      setOutput("Failed to submit code");
      setIsRunning(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* -------------------------------------------------------- */}
        {/* Top nav                                                   */}
        {/* -------------------------------------------------------- */}
        <Navbar />

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <>
                {/* ---------------------------------------------- */}
                {/* Page header + language select                  */}
                {/* ---------------------------------------------- */}
                <header className="page-header">
                  <h1 className="page-header__title">Remote Code Runner</h1>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="select"
                  >
                    <option value="js">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>
                </header>

                <div className="mode-switch">
                  <button
                    onClick={() => setMode("run")}
                    className={`mode-btn ${mode === "run" ? "mode-btn--active" : ""}`}
                  >
                    Custom Run
                  </button>
                  <button
                    onClick={() => setMode("submit")}
                    className={`mode-btn ${mode === "submit" ? "mode-btn--active" : ""}`}
                  >
                    Submit Solution
                  </button>
                </div>

                {/* ---------------------------------------------- */}
                {/* RUN MODE                                        */}
                {/* ---------------------------------------------- */}
                {mode === "run" ? (
                  <main className="workspace">
                    <section className="workspace__col">
                      <div className="panel">
                        <h3 className="panel__title">Code</h3>
                        <div className="panel__editor">
                          <CodeEditor
                            language={language}
                            code={code}
                            setCode={setCode}
                          />
                        </div>
                      </div>

                      <div className="panel">
                        <h3 className="panel__title">Input</h3>
                        <div className="panel__editor">
                          <InputBox input={input} setInput={setInput} />
                        </div>
                      </div>

                      <div className="action-row">
                        <button
                          onClick={runCode}
                          disabled={isRunning}
                          className="btn btn--primary"
                        >
                          {isRunning ? "Running..." : "Run Code"}
                        </button>
                        <span className="client-id">Client ID: {clientId}</span>
                      </div>
                    </section>

                    <section className="panel panel--output">
                      <div className="panel__header">
                        <h3 className="panel__title">Output</h3>
                        {status && <span className="status-pill">{status}</span>}
                      </div>
                      <div className="panel__editor panel__editor--fill">
                        <OutputBox output={output} status={status} />
                      </div>
                    </section>
                  </main>
                ) : (
                  /* ------------------------------------------ */
                  /* SUBMIT MODE                                  */
                  /* ------------------------------------------ */
                  <main className="workspace">
                    <section className="workspace__col">
                      <div className="panel">
                        <h3 className="panel__title">Select Problem</h3>
                        <select
                          value={problemId}
                          onChange={(e) => setProblemId(e.target.value)}
                          className="select select--full"
                        >
                          <option value="">Select a problem</option>
                          {problems.map((problem) => (
                            <option key={problem._id} value={problem._id}>
                              {problem.title}
                            </option>
                          ))}
                        </select>

                        {selectedProblem && (
                          <div className="problem-description">
                            {selectedProblem.description}
                          </div>
                        )}
                      </div>

                      <div className="panel">
                        <h3 className="panel__title">Solution</h3>
                        <div className="panel__editor">
                          <CodeEditor
                            language={language}
                            code={code}
                            setCode={setCode}
                          />
                        </div>
                      </div>

                      <div className="action-row">
                        <button
                          onClick={submitSolution}
                          disabled={isRunning || !problemId}
                          className="btn btn--primary"
                        >
                          {isRunning ? "Submitting..." : "Submit Code"}
                        </button>
                        <span className="client-id">Client ID: {clientId}</span>
                      </div>
                    </section>

                    <section className="panel">
                      <h3 className="panel__title">Result</h3>

                      {!judgeResult && (
                        <p className="empty-hint">
                          Submit a solution to see the verdict here.
                        </p>
                      )}

                      {judgeResult && (
                        <div className="result">
                          <div className="result__summary">
                            <div className="result__verdict">
                              <span className="result__verdict-text">
                                {judgeResult.verdict}
                              </span>
                              <VerdictBadge verdict={judgeResult.verdict} />
                            </div>
                            <span className="result__score">
                              {judgeResult.passedTests} / {judgeResult.totalTests} tests passed
                            </span>
                          </div>

                          <div>
                            <h4 className="result__section-title">Public Tests</h4>
                            <div className="test-list">
                              {judgeResult.testResults.map((test) => (
                                <div key={test.test} className="test-row">
                                  <span>Test {test.test}</span>
                                  <span
                                    className={
                                      test.status === "Passed" || test.status === "AC"
                                        ? "test-row__status test-row__status--pass"
                                        : "test-row__status test-row__status--fail"
                                    }
                                  >
                                    {test.status}
                                  </span>
                                  <span className="test-row__time">
                                    {test.executionTime} ms
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="result__section-title">Hidden Tests</h4>
                            <div className="hidden-tests">
                              {judgeResult.hiddenTests.passed} / {judgeResult.hiddenTests.total} passed
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  </main>
                )}
              </>
            }
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/submission/:id" element={<SubmissionDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;