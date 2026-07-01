import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = () => {
    if (!form.email.includes("@")) {
      setMessage("Enter your email first to reset password.");
      return;
    }

    setMessage("Password reset link sent to your email.");
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submitForm}>
        <span className="auth-logo">ElectraX</span>

        <h1>Welcome back</h1>
        <p>Sign in to continue your premium tech shopping.</p>

        <label> Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>

        <label> Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
        </label>

        <button type="button" className="reset-btn" onClick={resetPassword}>Forgot password?</button>

        {message && <div className="auth-message">{message}</div>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="social-login">
          <button type="button"> <FiMail /> Google </button>
        </div>

        <small>New here? <Link to="/signup">Create an account</Link></small>
      </form>
    </section>
  );
}

export default Login;
