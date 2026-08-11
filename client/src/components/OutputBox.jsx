function OutputBox({ output, status }) {
  return (
    <>
        <h2>Output</h2>
        {status && <p className="status">{status}</p>}
        <textarea value={output} placeholder="Output" readOnly></textarea>;
    </>
  );
}
export default OutputBox;
