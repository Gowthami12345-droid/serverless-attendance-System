import React from "react";

const subjectsByBranch = {
  CSE: ["Data Structures", "Algorithms", "Operating Systems", "DBMS", "Computer Networks"],
  ECE: ["Signals & Systems", "Digital Electronics", "Microprocessors", "VLSI", "Communication Systems"],
  EEE: ["Circuit Theory", "Electrical Machines", "Power Systems", "Control Systems", "Power Electronics"],
  ME:  ["Thermodynamics", "Fluid Mechanics", "Manufacturing", "Machine Design", "Heat Transfer"],
  IT:  ["Web Technologies", "Software Engineering", "Cloud Computing", "AI & ML", "Cyber Security"],
};

function Subjects({ branch }) {
  const subjects = subjectsByBranch[branch] || ["No subjects found for your branch."];

  return (
    <div className="content">
      <h3>📖 Subjects — {branch}</h3>
      <ul style={{ marginTop: "15px" }}>
        {subjects.map((sub, i) => (
          <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
            {i + 1}. {sub}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subjects;
