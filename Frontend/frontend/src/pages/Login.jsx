
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await res.json();

      console.log("Login response:", data);

      // login success
      if (res.ok && data.access) {

        // clear old tokens
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        // save tokens
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        console.log("Saved Token:", localStorage.getItem("access"));

        alert("Login successful");

        // redirect
        navigate("/home");

      } else {

        alert(data.detail || "Invalid username or password");

      }

    } catch (error) {

      console.error("Login error:", error);
      alert("Server error");

    }

  };

  return (
    <div className="login-container">

      <div className="login-card">

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <p>
          Don't have an account?
          <span onClick={()=>navigate("/register")}>
            Register
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;

