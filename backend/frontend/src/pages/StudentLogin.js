import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (id === "") {
      setMessage("❌ Enter Student ID");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://serverless-attendance-system.onrender.com"}/students`);
      const students = await response.json();

      const found = students.find((s) => s.id === id);

      if (found) {
        localStorage.setItem("student", JSON.stringify(found));
        setMessage("✅ Login successful!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setMessage("❌ Student ID not found. Please register first.");
      }
    } catch (error) {
      setMessage("❌ Cannot connect to server. Make sure backend is running.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="loginContainer">
      <h2>Student Login</h2>

      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red", marginBottom: "10px" }}>
          {message}
        </p>
      )}

      <input
        type="text"
        placeholder="Enter your Student ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        New student?{" "}
        <span
          style={{ color: "#007bff", cursor: "pointer" }}
          onClick={() => navigate("/register")}
        >
          Register here
        </span>
      </p>

      <p style={{ marginTop: "10px", fontSize: "14px" }}>
        <span
          style={{ color: "#007bff", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </span>
      </p>
    </div>
  );
}

export default StudentLogin;
