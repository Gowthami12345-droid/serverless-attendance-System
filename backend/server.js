const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let students = [];
let attendanceRecords = [];
let enrollments = []; // { studentId, studentName, subject, enrolledAt }

const mentors = [
  { id: "MENTOR001", password: "mentor123", name: "Prof. Sharma" },
  { id: "MENTOR002", password: "faculty456", name: "Prof. Rao" },
];

// ─── STUDENT ──────────────────────────────────────────────
app.get("/", (req, res) => res.send("Backend Running ✅"));

app.post("/register", (req, res) => {
  const student = req.body;
  if (students.find((s) => s.id === student.id))
    return res.status(400).send("Student ID already registered");
  students.push(student);
  console.log("Registered:", student.name);
  res.send("Student Registered Successfully");
});

app.get("/students", (req, res) => res.json(students));

app.post("/login/student", (req, res) => {
  const { id } = req.body;
  const student = students.find((s) => s.id === id);
  if (student) res.json({ success: true, student });
  else res.status(401).json({ success: false, message: "Student ID not found" });
});

// ─── MENTOR ───────────────────────────────────────────────
app.post("/login/mentor", (req, res) => {
  const { id, password } = req.body;
  const mentor = mentors.find((m) => m.id === id && m.password === password);
  if (mentor) res.json({ success: true, mentor });
  else res.status(401).json({ success: false, message: "Invalid credentials" });
});

// ─── ENROLLMENT ───────────────────────────────────────────
// Enroll in a subject
app.post("/enroll", (req, res) => {
  const { studentId, studentName, subject } = req.body;
  const already = enrollments.find(
    (e) => e.studentId === studentId && e.subject === subject
  );
  if (already) return res.status(400).json({ message: "Already enrolled in this subject" });
  const record = { studentId, studentName, subject, enrolledAt: new Date().toLocaleDateString("en-IN") };
  enrollments.push(record);
  res.json({ success: true, message: `Enrolled in ${subject} successfully` });
});

// Get enrollments for a student
app.get("/enroll/:studentId", (req, res) => {
  const records = enrollments.filter((e) => e.studentId === req.params.studentId);
  res.json(records);
});

// Get all enrollments (for mentor)
app.get("/enrollments", (req, res) => res.json(enrollments));

// Unenroll
app.delete("/enroll", (req, res) => {
  const { studentId, subject } = req.body;
  enrollments = enrollments.filter(
    (e) => !(e.studentId === studentId && e.subject === subject)
  );
  res.json({ success: true, message: "Unenrolled successfully" });
});

// ─── ATTENDANCE ───────────────────────────────────────────
app.post("/attendance", (req, res) => {
  const record = req.body;
  const already = attendanceRecords.find(
    (r) => r.studentId === record.studentId && r.date === record.date && r.subject === record.subject
  );
  if (already) return res.status(400).json({ message: "Attendance already marked for today" });
  attendanceRecords.push(record);
  res.json({ success: true });
});

app.get("/attendance/:studentId", (req, res) => {
  res.json(attendanceRecords.filter((r) => r.studentId === req.params.studentId));
});

app.get("/attendance", (req, res) => res.json(attendanceRecords));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));