import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import samplifylogo from "./assets/samplifylogo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token); // Store JWT token
        navigate("/dashboard"); // Redirect to Dashboard
      } else {
        setError(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Server Error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <img src={samplifylogo} alt="Samplify Logo" className="app-logo" />
      <form onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
