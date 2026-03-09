import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Subjects from "../components/Subjects";
import Results from "../components/Results";
import TimeTable from "../components/TimeTable";
import Attendance from "../components/Attendance";
import SubjectEnroll from "../components/SubjectEnroll";
import "../App.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("student")) || { name: "Student", id: "N/A", branch: "CSE" };
  const [activePage, setActivePage] = useState("enroll");

  const handleLogout = () => {
    localStorage.removeItem("student");
    navigate("/");
  };

  const menuItems = [
    { key: "enroll",     label: "📝 Enroll Subjects" },
    { key: "subjects",   label: "📖 Subjects" },
    { key: "attendance", label: "👁️ Attendance" },
    { key: "results",    label: "📊 Results" },
    { key: "timetable",  label: "🗓️ Time Table" },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Student Portal</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.key}
              onClick={() => setActivePage(item.key)}
              style={{
                padding: "12px", marginBottom: "6px", cursor: "pointer",
                borderRadius: "6px", fontSize: "14px",
                background: activePage === item.key ? "#2e3f54" : "transparent",
                borderLeft: activePage === item.key ? "3px solid #007bff" : "3px solid transparent",
              }}>
              {item.label}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{
          position: "absolute", bottom: "20px", left: "20px", width: "190px",
          padding: "10px", background: "#dc3545", color: "white",
          border: "none", borderRadius: "6px", cursor: "pointer",
        }}>🚪 Logout</button>
      </div>

      {/* Main */}
      <div className="main">
        {/* Profile */}
        <div className="profile">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="student" />
          <div>
            <h2>{student.name}</h2>
            <p>ID: {student.id}</p>
            <p>Branch: {student.branch} {student.section ? `| Section: ${student.section}` : ""}</p>
          </div>
        </div>

        {/* Dynamic Content */}
        {activePage === "enroll"     && <SubjectEnroll />}
        {activePage === "subjects"   && <Subjects branch={student.branch} />}
        {activePage === "attendance" && <Attendance />}
        {activePage === "results"    && <Results />}
        {activePage === "timetable"  && <TimeTable />}
      </div>
    </div>
  );
}

export default StudentDashboard;