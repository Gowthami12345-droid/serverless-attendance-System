import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function StudentRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const registerStudent = async () => {
    if (!name || !id || !branch || !section) {
      setMessage("❌ Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, id, branch, section }),
      });

      const data = await response.text();

      if (response.ok) {
        setMessage("✅ " + data);
        setTimeout(() => {
          navigate("/student");
        }, 1500);
      } else {
        setMessage("❌ " + data);
      }
    } catch (error) {
      setMessage("❌ Cannot connect to server. Make sure backend is running.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="loginContainer">
      <h2>Student Registration</h2>

      {message && (
        <p style={{ color: message.startsWith("✅") ? "green" : "red", marginBottom: "10px" }}>
          {message}
        </p>
      )}

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Student ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <select value={branch} onChange={(e) => setBranch(e.target.value)}>
        <option value="">Select Branch</option>
        <option value="CSE">CSE</option>
        <option value="ECE">ECE</option>
        <option value="EEE">EEE</option>
        <option value="ME">ME</option>
        <option value="IT">IT</option>
      </select>

      <select value={section} onChange={(e) => setSection(e.target.value)}>
        <option value="">Select Section</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>

      <button onClick={registerStudent} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        Already registered?{" "}
        <span
          style={{ color: "#007bff", cursor: "pointer" }}
          onClick={() => navigate("/student")}
        >
          Login here
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

export default StudentRegister;