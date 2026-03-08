import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function MentorDashboard() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mentor");
    if (!stored) { navigate("/mentor"); return; }
    setMentor(JSON.parse(stored));
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, a, e] = await Promise.all([
        fetch("http://localhost:5000/students").then(r => r.json()),
        fetch("http://localhost:5000/attendance").then(r => r.json()),
        fetch("http://localhost:5000/enrollments").then(r => r.json()),
      ]);
      setStudents(s); setAttendance(a); setEnrollments(e);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem("mentor"); navigate("/"); };

  const allSubjects = ["All", ...new Set([...enrollments.map(e => e.subject), ...attendance.map(a => a.subject)].filter(Boolean))];
  const allDates = ["All", ...new Set(attendance.map(r => r.date).filter(Boolean))];

  const filteredAttendance = attendance.filter(r => {
    const sub = filterSubject === "All" || r.subject === filterSubject;
    const date = filterDate === "All" || r.date === filterDate;
    const s = search === "" || r.studentId?.toLowerCase().includes(search.toLowerCase()) || r.studentName?.toLowerCase().includes(search.toLowerCase());
    return sub && date && s;
  });

  // Per-student summary
  const studentSummary = students.map(s => {
    const myEnrolled = enrollments.filter(e => e.studentId === s.id).map(e => e.subject);
    const myAttendance = attendance.filter(a => a.studentId === s.id);
    const attendedSubjects = [...new Set(myAttendance.map(a => a.subject).filter(Boolean))];
    return { ...s, enrolledSubjects: myEnrolled, attendedSubjects, totalAttendance: myAttendance.length };
  }).filter(s => search === "" || s.name?.toLowerCase().includes(search.toLowerCase()) || s.id?.toLowerCase().includes(search.toLowerCase()));

  // Per-subject summary
  const subjectList = [...new Set(enrollments.map(e => e.subject))];
  const subjectSummary = subjectList.map(sub => {
    const enrolled = enrollments.filter(e => e.subject === sub);
    const attended = attendance.filter(a => a.subject === sub);
    const uniqueAttended = new Set(attended.map(a => a.studentId)).size;
    return { subject: sub, enrolledCount: enrolled.length, attendedCount: attended.length, uniqueAttended };
  });

  const todayStr = new Date().toLocaleDateString("en-IN");

  if (!mentor) return null;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>👨‍🏫 Mentor</h2>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>{mentor.name}</p>
        <ul>
          {[
            { key: "overview",    label: "📊 Overview" },
            { key: "students",    label: "👩‍🎓 Students" },
            { key: "enrollments", label: "📝 Enrollments" },
            { key: "attendance",  label: "✅ Attendance" },
            { key: "subjects",    label: "📚 Subject Summary" },
          ].map(item => (
            <li key={item.key} onClick={() => setActiveTab(item.key)} style={{
              padding: "12px", marginBottom: "6px", cursor: "pointer", borderRadius: "6px", fontSize: "14px",
              background: activeTab === item.key ? "#2e3f54" : "transparent",
              borderLeft: activeTab === item.key ? "3px solid #007bff" : "3px solid transparent",
            }}>{item.label}</li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{
          position: "absolute", bottom: "20px", left: "20px", width: "190px",
          padding: "10px", background: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer",
        }}>🚪 Logout</button>
      </div>

      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>
            {activeTab === "overview" && "📊 Dashboard Overview"}
            {activeTab === "students" && "👩‍🎓 Enrolled Students"}
            {activeTab === "enrollments" && "📝 Subject Enrollments"}
            {activeTab === "attendance" && "✅ Attendance Records"}
            {activeTab === "subjects" && "📚 Subject Summary"}
          </h2>
          <button onClick={fetchAll} style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>🔄 Refresh</button>
        </div>

        {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>⏳ Loading data...</div> : (
          <>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "25px" }}>
                  {[
                    { label: "Total Students", value: students.length, icon: "👩‍🎓", color: "#007bff" },
                    { label: "Total Enrollments", value: enrollments.length, icon: "📝", color: "#fd7e14" },
                    { label: "Attendance Records", value: attendance.length, icon: "✅", color: "#28a745" },
                    { label: "Today's Attendance", value: attendance.filter(r => r.date === todayStr).length, icon: "📅", color: "#6f42c1" },
                  ].map((c, i) => (
                    <div key={i} style={{ flex: "1", minWidth: "130px", background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderTop: `4px solid ${c.color}`, textAlign: "center" }}>
                      <div style={{ fontSize: "30px" }}>{c.icon}</div>
                      <div style={{ fontSize: "26px", fontWeight: "bold", color: c.color }}>{c.value}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{c.label}</div>
                    </div>
                  ))}
                </div>

                <div className="content">
                  <h4>🕐 Recent Attendance (Last 10)</h4>
                  {attendance.length === 0 ? <p style={{ color: "#888", marginTop: "10px" }}>No records yet.</p> : (
                    <table className="timetable" style={{ marginTop: "10px" }}>
                      <thead><tr><th>Student</th><th>ID</th><th>Subject</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                      <tbody>
                        {[...attendance].reverse().slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td>{r.studentName}</td><td>{r.studentId}</td>
                            <td><strong>{r.subject}</strong></td>
                            <td>{r.date}</td><td>{r.time}</td>
                            <td style={{ color: "green", fontWeight: "bold" }}>✅ Present</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* STUDENTS */}
            {activeTab === "students" && (
              <div className="content">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <h4>Total: <span style={{ color: "#007bff" }}>{students.length}</span></h4>
                  <input placeholder="🔍 Search name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", width: "220px" }} />
                </div>
                {students.length === 0 ? <p style={{ color: "#888" }}>No students yet.</p> : (
                  <table className="timetable">
                    <thead><tr><th>#</th><th>Name</th><th>ID</th><th>Branch</th><th>Section</th><th>Enrolled Subjects</th><th>Attended</th><th>Attendance Count</th></tr></thead>
                    <tbody>
                      {studentSummary.map((s, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.id}</td>
                          <td>{s.branch}</td>
                          <td>{s.section}</td>
                          <td style={{ fontSize: "12px" }}>
                            {s.enrolledSubjects.length === 0 ? <span style={{ color: "#888" }}>None</span> :
                              s.enrolledSubjects.map((sub, j) => (
                                <span key={j} style={{ background: "#e3f2fd", color: "#1565c0", padding: "2px 7px", borderRadius: "10px", margin: "2px", display: "inline-block", fontSize: "11px" }}>{sub}</span>
                              ))}
                          </td>
                          <td style={{ fontSize: "12px" }}>
                            {s.attendedSubjects.length === 0 ? <span style={{ color: "#888" }}>None</span> :
                              s.attendedSubjects.map((sub, j) => (
                                <span key={j} style={{ background: "#d4edda", color: "#155724", padding: "2px 7px", borderRadius: "10px", margin: "2px", display: "inline-block", fontSize: "11px" }}>✅ {sub}</span>
                              ))}
                          </td>
                          <td>
                            <span style={{ background: s.totalAttendance > 0 ? "#d4edda" : "#f8d7da", color: s.totalAttendance > 0 ? "#155724" : "#721c24", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                              {s.totalAttendance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ENROLLMENTS */}
            {activeTab === "enrollments" && (
              <div className="content">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <h4>Total Enrollments: <span style={{ color: "#007bff" }}>{enrollments.length}</span></h4>
                  <input placeholder="🔍 Search student..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", width: "220px" }} />
                </div>
                {enrollments.length === 0 ? <p style={{ color: "#888" }}>No enrollments yet.</p> : (
                  <table className="timetable">
                    <thead><tr><th>#</th><th>Student Name</th><th>Student ID</th><th>Subject</th><th>Enrolled On</th><th>Attendance</th></tr></thead>
                    <tbody>
                      {enrollments
                        .filter(e => search === "" || e.studentId?.toLowerCase().includes(search.toLowerCase()) || e.studentName?.toLowerCase().includes(search.toLowerCase()))
                        .map((e, i) => {
                          const attended = attendance.filter(a => a.studentId === e.studentId && a.subject === e.subject).length;
                          return (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td><strong>{e.studentName}</strong></td>
                              <td>{e.studentId}</td>
                              <td><strong>{e.subject}</strong></td>
                              <td>{e.enrolledAt}</td>
                              <td>
                                <span style={{ background: attended > 0 ? "#d4edda" : "#fff3cd", color: attended > 0 ? "#155724" : "#856404", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                                  {attended > 0 ? `✅ ${attended} class(es)` : "⏳ Not yet"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ATTENDANCE */}
            {activeTab === "attendance" && (
              <div className="content">
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                  <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    {allSubjects.map((s, i) => <option key={i} value={s}>{s === "All" ? "📚 All Subjects" : s}</option>)}
                  </select>
                  <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    {allDates.map((d, i) => <option key={i} value={d}>{d === "All" ? "📅 All Dates" : d}</option>)}
                  </select>
                  <input placeholder="🔍 Search student..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", flex: 1 }} />
                </div>
                <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>Showing <strong>{filteredAttendance.length}</strong> records</p>
                {filteredAttendance.length === 0 ? <p style={{ color: "#888" }}>No records found.</p> : (
                  <table className="timetable">
                    <thead><tr><th>#</th><th>Student</th><th>ID</th><th>Subject</th><th>Date</th><th>Time</th><th>Method</th><th>Status</th></tr></thead>
                    <tbody>
                      {filteredAttendance.map((r, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td><td><strong>{r.studentName}</strong></td><td>{r.studentId}</td>
                          <td>{r.subject}</td><td>{r.date}</td><td>{r.time}</td><td>{r.method}</td>
                          <td style={{ color: "green", fontWeight: "bold" }}>✅ Present</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SUBJECTS */}
            {activeTab === "subjects" && (
              <div className="content">
                <h4 style={{ marginBottom: "15px" }}>Subject-wise Enrollment & Attendance</h4>
                {subjectSummary.length === 0 ? <p style={{ color: "#888" }}>No data yet.</p> : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    {subjectSummary.map((s, i) => (
                      <div key={i} style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "20px", minWidth: "180px", flex: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "4px solid #007bff" }}>
                        <h4 style={{ color: "#007bff", marginBottom: "12px", fontSize: "14px" }}>📖 {s.subject}</h4>
                        <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>Enrolled Students: <strong>{s.enrolledCount}</strong></p>
                        <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>Attended (unique): <strong>{s.uniqueAttended}</strong></p>
                        <p style={{ fontSize: "13px", color: "#555" }}>Total Records: <strong>{s.attendedCount}</strong></p>
                        <div style={{ marginTop: "10px", background: "#e9ecef", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#28a745", width: s.enrolledCount > 0 ? `${(s.uniqueAttended / s.enrolledCount) * 100}%` : "0%", transition: "width 0.5s" }} />
                        </div>
                        <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                          {s.enrolledCount > 0 ? Math.round((s.uniqueAttended / s.enrolledCount) * 100) : 0}% attendance rate
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;