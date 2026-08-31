import { useEffect, useRef, useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";
import { executeCode } from "./services/executionApi";
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
  
  const currentJobId = useRef(null);
  const { clientId, lastMessage } = useWebSocket();

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

      if (data.result.success) {
        setOutput(data.result.stdout);
      } else {
        setOutput(data.result.stderr || data.result.status);
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
