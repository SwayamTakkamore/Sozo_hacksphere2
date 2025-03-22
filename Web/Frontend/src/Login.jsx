import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./styles/Register.css";
import Navbar from "./components/Navbar";
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (userData) => {
    try {
      dispatch({ type: 'LOGIN', payload: userData });
    } catch (error) {
      console.warn('Redux dispatch failed, falling back to localStorage only');
    }
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("token", result.token);
        handleLoginSuccess(result.user);
      } else {
        alert(result.error || "Login failed.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <br /><a href="/register">Register</a></p>
      </div>
    </div>
    </>
  );
};

export default Login;
