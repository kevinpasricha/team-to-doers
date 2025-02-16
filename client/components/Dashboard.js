import React, { useEffect, useState } from "react";
import API from "../src/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setMessage(res.data))
      .catch(() => navigate("/login")); // Redirect if not authenticated
  }, [navigate]);

  const handleLogout = async () => {
    await API.post("/logout");
    navigate("/login"); // Redirect to login
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{message}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
