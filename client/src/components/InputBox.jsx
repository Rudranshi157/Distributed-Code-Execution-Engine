function InputBox({ input, setInput }) {
  return (
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Enter input..."
    />
  );
}

export default InputBox;