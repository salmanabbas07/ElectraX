import { useState } from "react";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submitForm}>
        <span className="auth-logo">ElectraX</span>

        <h1>Welcome back</h1>
        <p>Sign in to continue your premium tech shopping.</p>

        <label>
          {" "}
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>

        <label>
          {" "}
          Password
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
            />
            <button
              type="button"
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </label>

        <Link to="/forgot-password" className="reset-btn">
          Forgot password?
        </Link>

        {message && <div className="auth-message">{message}</div>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="social-login">
          <button type="button">
            {" "}
            <FiMail /> Google{" "}
          </button>
        </div>

        <small>
          New here? <Link to="/signup">Create an account</Link>
        </small>
      </form>
    </section>
  );
}

export default Login;
