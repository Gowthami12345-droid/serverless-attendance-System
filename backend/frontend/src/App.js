import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import StudentRegister from "./pages/StudentRegister";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import MentorLogin from "./pages/MentorLogin";
import MentorDashboard from "./pages/MentorDashboard";

import Subjects from "./components/Subjects";
import Results from "./components/Results";
import TimeTable from "./components/TimeTable";
import Attendance from "./components/Attendance";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/mentor" element={<MentorLogin />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/results" element={<Results />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </Router>
  );
}

export default App;