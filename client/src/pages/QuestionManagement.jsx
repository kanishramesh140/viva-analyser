import { useState } from "react";
import { createQuestion, listQuestions } from "../api/questions.js";

export default function QuestionManagement() {
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [tier, setTier] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  async function loadQuestions() {
    if (!subject.trim()) return;

    try {
      const result = await listQuestions(subject.trim());
      setQuestions(result.questions || result || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      await createQuestion(subject.trim(), {
        q: question.trim(),
        tier,
        kw: [],
        hints: [],
      });

      setQuestion("");
      setMessage("Question saved.");
      await loadQuestions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section>
      <h1>Question Management</h1>

      <input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Subject"
      />

      <button type="button" onClick={loadQuestions}>
        Load Questions
      </button>

      <form onSubmit={handleSubmit}>
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="tough">Tough</option>
          <option value="complex">Complex</option>
        </select>

        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Question"
          required
        />

        <button type="submit">Add Question</button>
      </form>

      {message && <p>{message}</p>}

      <pre>{JSON.stringify(questions, null, 2)}</pre>
    </section>
  );
}
