import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CLASS_WINDOWS = [
  { label: "Period 1", start: "09:00", end: "09:59" },
  { label: "Period 2", start: "10:00", end: "10:59" },
  { label: "Period 3", start: "11:00", end: "11:59" },
  { label: "Period 4", start: "12:00", end: "12:59" },
  { label: "Period 5", start: "13:00", end: "13:59" },
  { label: "Period 6", start: "14:00", end: "14:59" },
  { label: "Period 7", start: "17:00", end: "18:59" },
];

function isWithinClassWindow() {
  const now = new Date();
  const hhmm = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
  return CLASS_WINDOWS.find((w) => hhmm >= w.start && hhmm <= w.end) || null;
}

function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);

  const [step, setStep] = useState("idle");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [progress, setProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [detectStatus, setDetectStatus] = useState("");
  const [loadingEnroll, setLoadingEnroll] = useState(true);

  const student = JSON.parse(localStorage.getItem("student")) || { name: "Student", id: "N/A", branch: "CSE" };
  const today = new Date().toLocaleDateString("en-IN");

  useEffect(() => {
    fetchAttendance();
    fetchEnrolledSubjects();
    return () => stopCamera();
  }, []);

  const fetchEnrolledSubjects = async () => {
    setLoadingEnroll(true);
    try {
      const res = await fetch(`http://localhost:5000/enroll/${student.id}`);
      const data = await res.json();
      setEnrolledSubjects(data.map((e) => e.subject));
    } catch (err) { console.error(err); }
    setLoadingEnroll(false);
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/attendance/${student.id}`);
      const data = await res.json();
      setAttendanceLog(data);
    } catch (err) {}
  };

  const stopCamera = () => {
    if (detectionRef.current) clearInterval(detectionRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setVideoLoaded(false);
  };

  const handleSubjectSelect = () => {
    if (!selectedSubject) { alert("Please select a subject first!"); return; }
    const alreadyMarked = attendanceLog.some(
      (r) => r.date === today && r.studentId === student.id && r.subject === selectedSubject
    );
    if (alreadyMarked) { alert(`Attendance for "${selectedSubject}" already marked today!`); return; }
    const window = isWithinClassWindow();
    if (!window) {
      setStep("closed");
      setMessage("⏰ Attendance window is closed! Attendance can only be marked during class periods (9–10am, 10–11am, 11–12pm, 12–1pm, 1–2pm, 2–3pm, 3–4pm).");
      return;
    }
    setStep("camera");
    setDetectStatus("detecting");
    setMessage("📷 Camera starting...");
    startCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
      streamRef.current = mediaStream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadeddata = () => {
            setVideoLoaded(true);
            setMessage("👁️ Detecting person... Please look at the camera");
            startAutoDetection();
          };
        }
      }, 300);
    } catch (err) { setStep("error"); setMessage("❌ Camera error: " + err.message); }
  };

  const startAutoDetection = () => {
    let attempts = 0;
    const maxAttempts = 15;
    detectionRef.current = setInterval(() => {
      attempts++;
      const detected = checkPersonInFrame();
      if (detected) {
        clearInterval(detectionRef.current);
        setDetectStatus("found");
        setMessage("✅ Person detected! Scanning iris...");
        setTimeout(() => startScan(), 800);
      } else if (attempts >= maxAttempts) {
        clearInterval(detectionRef.current);
        setDetectStatus("not_found");
        setMessage("❌ No person detected. Please position your face in the camera.");
      } else {
        setMessage(`👁️ Scanning for person... (${attempts}/${maxAttempts})`);
      }
    }, 500);
  };

  const checkPersonInFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return false;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let totalBrightness = 0, skinTonePixels = 0;
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      totalBrightness += (r + g + b) / 3;
      if (r > 60 && r > g && g > b && (r - g) > 10) skinTonePixels++;
    }
    const total = pixels.length / 16;
    return (totalBrightness / total) > 15 && (skinTonePixels / total) > 0.05;
  };

  const startScan = () => {
    stopCamera();
    setStep("processing");
    setProgress(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 8;
      setProgress(prog);
      if (prog === 24) setMessage("🔍 Capturing iris pattern...");
      if (prog === 48) setMessage("🔍 Detecting unique eye structure...");
      if (prog === 72) setMessage("🔍 Matching iris with database...");
      if (prog === 88) setMessage("🔍 Verifying identity...");
      if (prog >= 100) { clearInterval(interval); markAttendance(); }
    }, 200);
  };

  const markAttendance = async () => {
    const now = new Date();
    const record = {
      studentId: student.id, studentName: student.name,
      subject: selectedSubject,
      date: now.toLocaleDateString("en-IN"), time: now.toLocaleTimeString("en-IN"),
      status: "Present", method: "Iris Scan",
    };
    try {
      await fetch("http://localhost:5000/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record),
      });
    } catch (err) {}
    setStep("done");
    setMessage(`✅ Attendance for "${selectedSubject}" marked successfully!`);
    setAttendanceLog((prev) => [record, ...prev]);
  };

  const reset = () => {
    stopCamera(); setStep("idle"); setSelectedSubject("");
    setMessage(""); setProgress(0); setVideoLoaded(false); setDetectStatus("");
  };

  return (
    <div className="content">
      <h3>👁️ Iris Scan Attendance</h3>
      <p style={{ color: "#555", marginTop: "5px" }}>
        Student: <strong>{student.name}</strong> | ID: <strong>{student.id}</strong> | Branch: <strong>{student.branch}</strong>
      </p>

      <div style={styles.windowInfo}>
        <strong>⏰ Attendance Window:</strong> Anytime during class — 9–10am, 10–11am, 11–12pm, 12–1pm, 1–2pm, 2–3pm, 3–4pm
      </div>

      {/* STEP 1 — Select Subject */}
      {step === "idle" && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ marginBottom: "12px" }}>📚 Select Enrolled Subject</h4>

          {loadingEnroll ? (
            <p style={{ color: "#888" }}>⏳ Loading your enrolled subjects...</p>
          ) : enrolledSubjects.length === 0 ? (
            <div style={{ ...styles.errorBox, marginTop: "10px" }}>
              ⚠️ You have not enrolled in any subjects yet. Please go to <strong>Enroll Subjects</strong> first.
            </div>
          ) : (
            <>
              <div style={styles.subjectGrid}>
                {enrolledSubjects.map((sub, i) => {
                  const marked = attendanceLog.some(
                    (r) => r.date === today && r.subject === sub && r.studentId === student.id
                  );
                  return (
                    <div key={i} style={{
                      ...styles.subjectCard,
                      background: marked ? "#d4edda" : selectedSubject === sub ? "#007bff" : "white",
                      color: marked ? "#155724" : selectedSubject === sub ? "white" : "#333",
                      border: marked ? "2px solid #28a745" : selectedSubject === sub ? "2px solid #0056b3" : "2px solid #ddd",
                      cursor: marked ? "default" : "pointer",
                    }} onClick={() => !marked && setSelectedSubject(sub)}>
                      <span style={{ fontSize: "24px" }}>{marked ? "✅" : "📖"}</span>
                      <span style={{ fontSize: "12px", marginTop: "6px", textAlign: "center", fontWeight: "500" }}>{sub}</span>
                      {marked && <span style={{ fontSize: "11px", color: "#28a745", fontWeight: "bold" }}>Marked ✓</span>}
                    </div>
                  );
                })}
              </div>
              {selectedSubject && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <p style={{ marginBottom: "12px", fontWeight: "bold", color: "#007bff" }}>
                    📌 Selected: {selectedSubject}
                  </p>
                  <button style={styles.scanBtn} onClick={handleSubjectSelect}>
                    📷 Start Iris Scan
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* STEP 2 — Camera */}
      {step === "camera" && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            📚 Subject: <span style={{ color: "#007bff" }}>{selectedSubject}</span>
          </p>
          <div style={styles.cameraWrapper}>
            <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div style={styles.irisOverlay}>
              <div style={{
                ...styles.irisRing,
                borderColor: detectStatus === "found" ? "#00ff88" : detectStatus === "not_found" ? "#ff4444" : "#ffcc00",
              }} />
              <div style={{
                ...styles.irisRingInner,
                borderColor: detectStatus === "found" ? "#00ff88" : detectStatus === "not_found" ? "#ff4444" : "#ffcc00",
              }} />
            </div>
            <div style={{
              ...styles.statusBadge,
              background: detectStatus === "found" ? "#00ff88" : detectStatus === "not_found" ? "#ff4444" : "#ffcc00",
            }}>
              {detectStatus === "found" ? "✅ Person Detected" : detectStatus === "not_found" ? "❌ Not Detected" : "🔍 Scanning..."}
            </div>
          </div>
          <p style={{ marginTop: "12px", fontWeight: "bold",
            color: detectStatus === "found" ? "#28a745" : detectStatus === "not_found" ? "#dc3545" : "#e67e00" }}>
            {message}
          </p>
          {detectStatus === "not_found" && (
            <div style={{ marginTop: "15px" }}>
              <button style={styles.scanBtn} onClick={() => { setDetectStatus("detecting"); startAutoDetection(); }}>🔄 Try Again</button>
              <button style={styles.cancelBtn} onClick={reset}>Cancel</button>
            </div>
          )}
          {detectStatus === "detecting" && (
            <button style={{ ...styles.cancelBtn, marginTop: "15px" }} onClick={reset}>Cancel</button>
          )}
        </div>
      )}

      {/* STEP 3 — Processing */}
      {step === "processing" && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>🔍</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: progress + "%" }} />
          </div>
          <p style={{ marginTop: "5px", fontSize: "13px", color: "#888" }}>{progress}%</p>
          <p style={{ marginTop: "10px", fontWeight: "bold", color: "#007bff" }}>{message}</p>
        </div>
      )}

      {/* STEP 4 — Done */}
      {step === "done" && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <div style={{ fontSize: "70px" }}>✅</div>
          <div style={styles.successBox}>{message}</div>
          <button style={styles.scanBtn} onClick={reset}>📚 Mark Another Subject</button>
        </div>
      )}

      {step === "closed" && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <div style={{ fontSize: "60px" }}>⏰</div>
          <div style={styles.errorBox}>{message}</div>
          <button style={styles.scanBtn} onClick={reset}>← Go Back</button>
        </div>
      )}

      {step === "error" && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div style={styles.errorBox}>{message}</div>
          <button style={styles.scanBtn} onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Log */}
      <div style={{ marginTop: "35px" }}>
        <h4>📋 Today's Attendance — {today}</h4>
        {attendanceLog.filter(r => r.date === today).length === 0 ? (
          <p style={{ color: "#888", marginTop: "10px" }}>No attendance marked today yet.</p>
        ) : (
          <table className="timetable" style={{ marginTop: "10px" }}>
            <thead><tr><th>Subject</th><th>Time</th><th>Status</th><th>Method</th></tr></thead>
            <tbody>
              {attendanceLog.filter(r => r.date === today).map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.subject}</strong></td>
                  <td>{r.time}</td>
                  <td style={{ color: "green", fontWeight: "bold" }}>✅ {r.status}</td>
                  <td>{r.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  windowInfo: { background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px 15px", marginTop: "12px", fontSize: "13px", color: "#555" },
  subjectGrid: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" },
  subjectCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "130px", height: "95px", borderRadius: "10px", padding: "10px", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  scanBtn: { padding: "12px 28px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer", margin: "5px" },
  cancelBtn: { padding: "12px 28px", background: "#dc3545", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer", margin: "5px" },
  cameraWrapper: { position: "relative", display: "inline-block", borderRadius: "12px", overflow: "hidden", border: "3px solid #007bff" },
  video: { width: "340px", height: "260px", objectFit: "cover", display: "block", background: "#000" },
  irisOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" },
  irisRing: { position: "absolute", top: "50%", left: "50%", width: "140px", height: "140px", borderRadius: "50%", border: "3px solid #ffcc00", transform: "translate(-50%, -50%)", animation: "pulse 1.5s infinite", transition: "border-color 0.3s" },
  irisRingInner: { position: "absolute", top: "50%", left: "50%", width: "55px", height: "55px", borderRadius: "50%", border: "2px solid #ffcc00", transform: "translate(-50%, -50%)", transition: "border-color 0.3s" },
  statusBadge: { position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", color: "#000" },
  progressBar: { width: "340px", height: "14px", background: "#e0e0e0", borderRadius: "7px", margin: "10px auto", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #007bff, #00ff88)", borderRadius: "7px", transition: "width 0.2s ease" },
  successBox: { background: "#d4edda", color: "#155724", padding: "15px 20px", borderRadius: "8px", marginBottom: "15px", fontWeight: "bold", fontSize: "15px" },
  errorBox: { background: "#f8d7da", color: "#721c24", padding: "15px 20px", borderRadius: "8px", marginBottom: "15px", fontWeight: "bold" },
};

export default Attendance;