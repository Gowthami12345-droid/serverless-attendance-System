import React from "react";

const results = [
  { subject: "Mathematics", marks: 85, grade: "A" },
  { subject: "Physics", marks: 78, grade: "B+" },
  { subject: "Chemistry", marks: 90, grade: "A+" },
  { subject: "English", marks: 72, grade: "B" },
  { subject: "Core Subject", marks: 88, grade: "A" },
];

function Results() {
  const total = results.reduce((sum, r) => sum + r.marks, 0);
  const avg = (total / results.length).toFixed(1);

  return (
    <div className="content">
      <h3>📊 Exam Results</h3>
      <table className="timetable" style={{ marginTop: "15px" }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.subject}</td>
              <td>{r.marks}/100</td>
              <td style={{ fontWeight: "bold", color: r.marks >= 85 ? "green" : r.marks >= 70 ? "orange" : "red" }}>
                {r.grade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "15px", fontWeight: "bold" }}>Average: {avg}%</p>
    </div>
  );
}

export default Results;
