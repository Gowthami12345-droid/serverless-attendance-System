import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Welcome() {

  const navigate = useNavigate();

  return (
    <div className="welcome">

      <div className="overlay">

        <h1>Serverless Attendance System</h1>

        <button onClick={() => navigate("/register")}>
          Student Registration
        </button>

        <button onClick={() => navigate("/student")}>
          Student Login
        </button>

        <button onClick={() => navigate("/mentor")}>
          Mentor / Faculty Login
        </button>

      </div>

    </div>
  );
}

export default Welcome;