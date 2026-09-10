import { useEffect, useRef, useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";
import { executeCode, submitCode} from "./services/executionApi";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import SubmissionDetails from "./components/SubmissionDetails";
import { useWebSocket } from "./context/WebSocketContext";

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
  const API_URL = "http://localhost:3000"; 


  useEffect(() => {
    const fetchProblems = async () => {
      try{
        const response = await fetch(`${API_URL}/api/problems`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        setProblems(data);
      
      }catch(error){
        console.error("Failed to fetch problems:", error);
      }
    }
    fetchProblems();

  },[]);

  useEffect(() => {
  if (!lastMessage) {
      return;
    }

    const data = lastMessage;

    if (data.jobId !== currentJobId.current) {
      return;
    }

    console.log("received", data);

    if (data.status === "active") {
      setStatus("active");
    }

    else if (data.status === "completed") {
      setStatus(data.result.status);

      if(data.result.verdict){
        //judge result
        setJudgeResult(data.result);
      }else{
        //run code result
        if (data.result.success) {
          setOutput(data.result.stdout);
        } else {
          setOutput(data.result.stderr || data.result.status);
        }
      }
      

      setIsRunning(false);
    }

    else if (data.status === "failed") {
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
      currentJobId.current  = jobId;

    } catch (err) {
      console.log(err.message);
      setOutput("Failed to execute code");
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if(!problemId) {
      setOutput("Please select a problem");
      return;
    }
    if(!code.trim()){
      setOutput("Please write some code");
      return;
    }

    setOutput("");
    setStatus("");
    setIsRunning(true);
    setJudgeResult(null);

    try{
      const data = await submitCode(
        problemId,
        language,
        code,
        clientId
      );

      console.log("Submission created:", data);

      currentJobId.current = data.jobId;
      setStatus("queued");
    }catch(err){
      console.log(err.message);
      setOutput("Failed to submit code");
      setIsRunning(false);
    }
  };

  

  return (
    <BrowserRouter>
      <nav>
        
        <Link to="/">Code Runner</Link>
        {" | "}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
      <Route
          path="/login"
          element={<Login />}
      />
     
        <Route
          path="/"
          element={
            <>
              <header className="header">
                <h1>Remote Code Runner</h1>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="js">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </header>
              <div>
                <button onClick={() => setMode("run")}>
                  Run Code
                </button>

                <button onClick={() => setMode("submit")}>
                  Submit Solution
                </button>
              </div>
              {mode === "run" ? (

              <main className="container">
                 
                  <h3>Code</h3>

                  <CodeEditor
                    language={language}
                    code={code}
                    setCode={setCode}
                  />

                  <h3>Input</h3>

                  <InputBox
                    input={input}
                    setInput={setInput}
                  />

                  <button onClick={runCode} disabled={isRunning}>
                    {isRunning ? "Running..." : "Run Code"}
                  </button>

                  <p>Client ID: {clientId}</p>

                  <OutputBox
                    output={output}
                    status={status}
                  />
                  
                </main>
                ) : (
                  <main className="container">
                 
                  <h3>Submit</h3>

                  <h4>Select Problem</h4>
                  <select
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                  >
                    <option value="">Select a problem</option>
                    {problems.map((problem) => (
                      <option key={problem._id} value={problem._id}>
                        {problem.title}
                      </option>
                    ))}
                  </select>


                  <h4>Problem Description</h4>

                  {selectedProblem && (
                    <p>{selectedProblem.description}</p>
                  )}

                  

                  <CodeEditor
                    language={language}
                    code={code}
                    setCode={setCode}
                  />

                  <button onClick={submitSolution} disabled={isRunning || !problemId}>
                    {isRunning ? "Submitting..." : "Submit Code"}
                  </button>

                  <p>Client ID: {clientId}</p>
       
                  {judgeResult && (
                    <div>
                      <h3>Result</h3>

                      <p>
                        Verdict: {judgeResult.verdict}
                      </p>

                      <p>
                        Tests Passed: {judgeResult.passedTests} / {" "}{judgeResult.totalTests}
                      </p>

                      <h4>Public Tests</h4>

                      {judgeResult.testResults.map((test) => (
                        <div key={test.test}>
                          <span>
                            Test {test.test}
                          </span>
                          {" - "}
                          <span>
                            {test.status}
                          </span>
                          {" - "}
                          <span>
                            {test.executionTime} ms
                          </span>
                          
        
                        </div>
                      ))}

                      <h4>Hidden Tests</h4>

                      <p>
                        {judgeResult.hiddenTests.passed} /{" "}
                        {judgeResult.hiddenTests.total}
                      </p>
                    </div>
                  )}
                </main>
                )}
            </>
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
         <Route
          path="/dashboard/submission/:id"
          element={<SubmissionDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
