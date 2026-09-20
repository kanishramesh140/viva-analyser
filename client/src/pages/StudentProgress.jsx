import { useEffect, useState } from "react";
import { getStudentProgress } from "../api/student.js";

export default function StudentProgress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getStudentProgress()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <section>
      <h1>Student Progress</h1>

      {!data ? (
        <p>No progress data available yet.</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </section>
  );
}
