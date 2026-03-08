import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function MentorLogin() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) { setMessage("❌ Please fill all fields."); return; }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/login/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("mentor", JSON.stringify(data.mentor));
        setMessage("✅ Login successful!");
        setTimeout(() => navigate("/mentor-dashboard"), 1000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Cannot connect to server. Make sure backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="loginContainer">
      <h2>👨‍🏫 Mentor / Faculty Login</h2>
      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red", marginBottom: "10px" }}>
          {message}
        </p>
      )}
      <input type="text" placeholder="Faculty ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <div style={{ marginTop: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", fontSize: "13px", color: "#555" }}>
        <strong>Demo Credentials:</strong><br />
        ID: MENTOR001 | Password: mentor123<br />
        ID: MENTOR002 | Password: faculty456
      </div>
      <p style={{ marginTop: "12px", fontSize: "14px" }}>
        <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate("/")}>← Back to Home</span>
      </p>
    </div>
  );
}

export default MentorLogin;