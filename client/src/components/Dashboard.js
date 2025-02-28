import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setMessage(res.data))
      .catch(() => navigate("/login")); // Redirect if not authenticated
  }, [navigate]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await API.get("/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleLogout = async () => {
    await API.post("/logout");
    navigate("/"); // Redirect to login
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate.trim()) {
      alert("Please enter all fields!");
      return;
    }

    const newTodo = { title, description, dueDate };

    try {
      const response = await API.post("/todos", newTodo);
      alert("Todo added successfully!");

      setTitle("");
      setDescription("");
      setDueDate("");

      setTodos((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Dashboard</h2>
      <p>{message}</p>
      <button onClick={handleLogout}>Logout</button>
      <br />

      <div id="todos">
        {todos.map((todo) => {
          return (
            <div className="todo">
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
              <small>
                Due:{" "}
                {new Date(todo.dueDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>
            </div>
          );
        })}
      </div>
      <br />
      <br />
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <br />
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <br />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

export default Dashboard;
