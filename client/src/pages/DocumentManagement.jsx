import { useState } from "react";

export default function DocumentManagement() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setMessage("Select a document first.");
      return;
    }

    setMessage(
      `Selected: ${file.name}. Backend document processing will be connected next.`
    );
  }

  return (
    <section>
      <h1>Reference Document Management</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".txt,.md,.json,.csv,.pdf,.docx"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />

        <button type="submit">Prepare Document</button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}
