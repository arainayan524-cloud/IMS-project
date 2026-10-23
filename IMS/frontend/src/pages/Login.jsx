import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      if (response.data.success) {
        login(response.data.user, response.data.token);

        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
          return;
        }

        navigate("/customer-dashboard", { replace: true });
        return;
      }

      setError(response.data.message || "Failed to login");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Failed to login");
        return;
      }

      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center bg-linear-to-b from-[#16a34a] from-50% to-gray-100 to-50% space-y-6">
      <h2
        className="text-3xl text-white"
        style={{ fontFamily: "'Cookie', cursive" }}
      >
        Inventory (POS) Management System
      </h2>

      <div className="border border-gray-200 shadow-lg p-6 w-80 bg-white">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300"
              name="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>
          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
