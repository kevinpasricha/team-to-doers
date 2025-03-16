import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
      navigate("/login"); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <img className="mx-auto" src="./img/todo.png" />
        <h2 className="mb-4 text-center text-2xl font-semibold text-gray-700">
          Register
        </h2>
        {error && (
          <p className="mb-2 text-center text-sm text-red-500">{error}</p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 focus:outline-none"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
