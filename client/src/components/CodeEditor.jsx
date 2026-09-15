import Editor from "@monaco-editor/react";

function CodeEditor({ language, code, setCode }) {
  const editorLanguage = {
    js: "javascript",
    java: "java",
    python: "python",
    cpp: "cpp",
  };

  return (
    <Editor
      height="400px"
      language={editorLanguage[language]}
      value={code}
      onChange={(value) => setCode(value || "")}
      theme="vs"

      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,

        mouseWheelZoom: false,
        fastScrollSensitivity: 5,
      }}
    />
  );
}

export default CodeEditor;
