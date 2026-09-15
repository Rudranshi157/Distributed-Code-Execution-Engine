function InputBox({ input, setInput }) {
  return (
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Enter input..."
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

        caretColor: "#38BDF8",
      }}
    />
  );
}

export default InputBox;
