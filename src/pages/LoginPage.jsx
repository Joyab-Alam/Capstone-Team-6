import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Replace with env vars or API call
    if (id === "admin" && password === "1234") {
      navigate("/result");
    } else {
      setError("❌ Incorrect ID or Password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-96">
        <img
          src="https://moodle.aih.edu.au/pluginfile.php/1/theme_moove/logo/1762736321/aih-logo-v6.png"
          alt="AIH Logo"
          className="w-32 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-center mb-4">AIH Login</h2>
        <form onSubmit={handleLogin} className="formmain">
          <input
            type="text"
            placeholder="User ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input-box"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-box"
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
