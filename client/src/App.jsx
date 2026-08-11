import { useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";
import { executeCode, pollResult } from "./services/executionApi";

function App() {
  const [language, setLanguage] = useState("js");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");

  const runCode = async () => {
    setOutput("");
    setStatus("");
    setIsRunning(true);

    try {
      const jobId = await executeCode(language, code, input);

      const result = await pollResult(jobId);

      if (result.state === "completed") {
        setStatus(result.result.status);
        if (result.result.success) {
          setOutput(result.result.stdout);
        } else {
          setOutput(result.result.stderr || result.result.status);
        }
      }
      if (result.state === "failed") {
        setOutput(result.error);
      }
    } catch (err) {
      console.log(err.message);
      setOutput("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };
 

  return (
    <>
      <header className="header">
        <h1>Remote Code Runner</h1>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="js">JavaScript</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </header>
      <main className="container">
        <h3>code</h3>
        <CodeEditor language={language} code={code} setCode={setCode} />
        <h3>Input</h3>
        <InputBox input={input} setInput={setInput} />
        <button onClick={runCode} disabled={isRunning}>
          {isRunning ? "Running..." : "Run Code"}
        </button>
        <OutputBox output={output} status={status} />
      </main>
    </>
  );
}

export default App;
