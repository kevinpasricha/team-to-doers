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
  const [editingTodo, setEditingTodo] = useState(null);

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

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.dueDate.split("T")[0]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you wan to delete this todo?")) return;

    try {
      await API.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo: ", error);
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

    const todoData = { title, description, dueDate };

    try {
      if (editingTodo) {
        const response = await API.put(`/todos/${editingTodo.id}`, todoData);
        alert("Todo edited successfully!");
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === editingTodo.id ? { ...todo, ...todoData } : todo
          )
        );
        setEditingTodo(null);
      } else {
        const response = await API.post("/todos", todoData);
        alert("Todo added successfully!");
        setTodos((prev) => [...prev, response.data]);
      }

      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-6">
      {/* Dashboard Header */}
      <div className="mb-4 w-full max-w-4xl text-center">
        <img className="mx-auto" src="./img/todo.png" />
        <h2 className="text-3xl font-semibold text-gray-700">Dashboard</h2>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={handleLogout}
          className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Add Todo Form */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Add a Todo
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600 focus:outline-none"
            >
              {editingTodo ? "Update Todo" : "Add Todo"}
            </button>
          </form>
        </div>

        {/* Right Column: List of Todos */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Your Todos
          </h3>
          {todos.length === 0 ? (
            <p className="text-center text-gray-500">
              No todos yet. Add one on the left!
            </p>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-gray-700">
                    {todo.title}
                  </h3>
                  <p className="text-gray-600">{todo.description}</p>
                  <small className="block text-gray-500">
                    Due:{" "}
                    {new Date(todo.dueDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </small>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="rounded-lg bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="rounded-lg bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
