import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (email === "") {
      setError("Please enter an email.");
      return;
    }
    if (username === "") {
      setError("Please enter a username.");
      return;
    }
    if (password === "" || password.length < 8) {
      setError("Please enter a password of at least 8 characters.");
      return;
    }

    try {
      await API.post("/register", { username, email, password });
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Register;
