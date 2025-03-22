import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Register.css";
import Navbar from "./components/Navbar";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default role
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        navigate("/login"); // Redirect to login page
      } else {
        alert(result.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          
          {/* Role Selection Dropdown */}
          <select name="role" onChange={handleChange} required>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <br /> <a href="/login">Login</a></p>
      </div>
    </div>
    </>
  );
}
