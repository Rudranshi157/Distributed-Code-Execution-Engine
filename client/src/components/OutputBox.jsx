function OutputBox({ output, status }) {
  return (
    <div>
      <h2
        style={{
          color: "#CBD5E1",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        Output
      </h2>

      {status && (
        <p
          style={{
            color: "#38BDF8",
            fontSize: "13px",
            marginBottom: "8px",
          }}
        >
          {status}
        </p>
      )}

      <textarea
        value={output}
        placeholder="Output"
        readOnly
        style={{
          width: "100%",
          minHeight: "120px",
          boxSizing: "border-box",

          backgroundColor: "#0F172A",
          color: "#CBD5E1",

          border: "1px solid #1E293B",
          borderRadius: "6px",

          padding: "12px",

          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "13px",
          lineHeight: "1.5",

          resize: "vertical",
          outline: "none",

          caretColor: "transparent",
        }}
      />
    </div>
  );
}

export default OutputBox;
