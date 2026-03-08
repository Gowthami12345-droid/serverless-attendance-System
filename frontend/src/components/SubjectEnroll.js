import React, { useState, useEffect } from "react";

const subjectsByBranch = {
  CSE: ["Data Structures", "Algorithms", "Operating Systems", "DBMS", "Computer Networks"],
  ECE: ["Signals & Systems", "Digital Electronics", "Microprocessors", "VLSI", "Communication Systems"],
  EEE: ["Circuit Theory", "Electrical Machines", "Power Systems", "Control Systems", "Power Electronics"],
  ME:  ["Thermodynamics", "Fluid Mechanics", "Manufacturing", "Machine Design", "Heat Transfer"],
  IT:  ["Web Technologies", "Software Engineering", "Cloud Computing", "AI & ML", "Cyber Security"],
};

function SubjectEnroll() {
  const student = JSON.parse(localStorage.getItem("student")) || { name: "Student", id: "N/A", branch: "CSE" };
  const subjects = subjectsByBranch[student.branch] || subjectsByBranch["CSE"];

  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/enroll/${student.id}`);
      const data = await res.json();
      setEnrolled(data.map((e) => e.subject));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showMsg = (msg, type = "success") => {
    setMessage(msg);
    setMsgType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEnroll = async (subject) => {
    try {
      const res = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, studentName: student.name, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolled((prev) => [...prev, subject]);
        showMsg(`✅ Enrolled in "${subject}" successfully!`);
      } else {
        showMsg("❌ " + data.message, "error");
      }
    } catch (err) {
      showMsg("❌ Cannot connect to server", "error");
    }
  };

  const handleUnenroll = async (subject) => {
    if (!window.confirm(`Unenroll from "${subject}"?`)) return;
    try {
      const res = await fetch("http://localhost:5000/enroll", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, subject }),
      });
      if (res.ok) {
        setEnrolled((prev) => prev.filter((s) => s !== subject));
        showMsg(`✅ Unenrolled from "${subject}"`);
      }
    } catch (err) {
      showMsg("❌ Cannot connect to server", "error");
    }
  };

  return (
    <div className="content">
      <h3>📚 Subject Enrollment</h3>
      <p style={{ color: "#555", marginTop: "5px" }}>
        Branch: <strong>{student.branch}</strong> — Select subjects to enroll
      </p>

      {message && (
        <div style={{
          padding: "10px 15px", borderRadius: "8px", margin: "12px 0", fontWeight: "bold",
          background: msgType === "success" ? "#d4edda" : "#f8d7da",
          color: msgType === "success" ? "#155724" : "#721c24",
        }}>{message}</div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "15px", margin: "15px 0" }}>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>📖</span>
          <strong style={{ fontSize: "20px", color: "#007bff" }}>{subjects.length}</strong>
          <span style={{ fontSize: "12px", color: "#888" }}>Available</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>✅</span>
          <strong style={{ fontSize: "20px", color: "#28a745" }}>{enrolled.length}</strong>
          <span style={{ fontSize: "12px", color: "#888" }}>Enrolled</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>📋</span>
          <strong style={{ fontSize: "20px", color: "#fd7e14" }}>{subjects.length - enrolled.length}</strong>
          <span style={{ fontSize: "12px", color: "#888" }}>Remaining</span>
        </div>
      </div>

      {/* Subject Cards */}
      {loading ? (
        <p style={{ color: "#888" }}>⏳ Loading...</p>
      ) : (
        <div style={styles.grid}>
          {subjects.map((sub, i) => {
            const isEnrolled = enrolled.includes(sub);
            return (
              <div key={i} style={{
                ...styles.card,
                borderTop: isEnrolled ? "4px solid #28a745" : "4px solid #007bff",
                background: isEnrolled ? "#f8fff8" : "white",
              }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                  {isEnrolled ? "✅" : "📖"}
                </div>
                <h4 style={{ fontSize: "14px", marginBottom: "8px", color: "#333", textAlign: "center" }}>{sub}</h4>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "12px", marginBottom: "12px",
                  background: isEnrolled ? "#d4edda" : "#e3f2fd",
                  color: isEnrolled ? "#155724" : "#1565c0",
                  fontWeight: "bold",
                }}>
                  {isEnrolled ? "Enrolled ✓" : "Not Enrolled"}
                </span>
                <button
                  onClick={() => isEnrolled ? handleUnenroll(sub) : handleEnroll(sub)}
                  style={{
                    width: "100%", padding: "8px", border: "none", borderRadius: "6px",
                    cursor: "pointer", fontSize: "13px", fontWeight: "bold",
                    background: isEnrolled ? "#dc3545" : "#007bff",
                    color: "white",
                  }}>
                  {isEnrolled ? "Unenroll" : "Enroll Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Enrolled list */}
      {enrolled.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <h4>📋 Your Enrolled Subjects</h4>
          <table className="timetable" style={{ marginTop: "10px" }}>
            <thead>
              <tr><th>#</th><th>Subject</th><th>Status</th></tr>
            </thead>
            <tbody>
              {enrolled.map((sub, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{sub}</strong></td>
                  <td style={{ color: "green", fontWeight: "bold" }}>✅ Enrolled</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  statCard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    background: "white", padding: "15px 20px", borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: "90px", gap: "4px",
  },
  grid: { display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "10px" },
  card: {
    display: "flex", flexDirection: "column", alignItems: "center",
    width: "150px", padding: "15px 10px", borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s",
  },
};

export default SubjectEnroll;