// src/pages/Register.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username: username,
          password: password
        }
      );

      alert("Registration successful");

      // Redirect to login page
      navigate("/login");

    } catch (error) {

      console.error(error.response?.data);
      alert("Registration failed");

    }

  };

  return (

    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={registerUser}
        className="bg-white p-6 shadow rounded w-80"
      >

        <h2 className="text-xl font-bold mb-4">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border w-full p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 mb-3"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          Register
        </button>

      </form>

    </div>

  );

}

export default Register;