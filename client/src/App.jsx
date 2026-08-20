import { useEffect, useRef, useState } from "react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import InputBox from "./components/InputBox";
import OutputBox from "./components/OutputBox";
import { executeCode } from "./services/executionApi";

function App() {
  const [language, setLanguage] = useState("js");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");
  
  const currentJobId = useRef(null);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9000");

    socket.onopen = () => {
      console.log("websocket connection");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if(data.type === "client-id"){
        setClientId(data.clientId);
        return;
      }
      if(data.jobId === currentJobId.current){
        console.log("received", data);
        if(data.status === "active"){
          setStatus("active");
        }else if(data.status === "completed" ){
          setStatus(data.result.status);
          if (data.result.success) {
              setOutput(data.result.stdout);
          } else {
              setOutput(data.result.stderr || data.result.status);
          }
           setIsRunning(false);
        }else if(data.status === "failed"){
          setStatus(data.status);
           setOutput(data.error);
           setIsRunning(false);
           
          
        }
      }
      
    };

    return () => {
      socket.close();
    };
  }, []);


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
        <p>Client ID: {clientId}</p>
        <OutputBox output={output} status={status} />
      </main>
    </>
  );
}

export default App;
