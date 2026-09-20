export function summariseFacultyRecords(records = []) {
  const byStudent = new Map();

  for (const record of records) {
    const studentId = record.studentId || "unknown";

    if (!byStudent.has(studentId)) {
      byStudent.set(studentId, {
        studentId,
        vivaCount: 0,
      });
    }

    byStudent.get(studentId).vivaCount += 1;
  }

  return {
    totalVivas: records.length,
    totalStudents: byStudent.size,
    students: [...byStudent.values()],
  };
}
