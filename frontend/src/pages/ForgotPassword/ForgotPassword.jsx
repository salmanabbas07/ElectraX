import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Login/Login.css";

const API_BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forget-password`,
        { email },
      );
      setMessage(
        response.data.message || "Password reset link sent to your email.",
      );
      setIsSuccess(true);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to send reset link. Please try again.",
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-logo">ElectraX</span>

        <h1>Forgot Password</h1>
        <p>Enter your email address to receive a password reset link.</p>

        {!isSuccess && (
          <label>
            {" "}
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
        )}

        {message && <div className="auth-message">{message}</div>}

        {!isSuccess && (
          <button className="primary-btn" disabled={loading}>
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        )}

        <small style={{ marginTop: "18px", display: "block" }}>
          Remember your password? <Link to="/login">Login</Link>
        </small>
      </form>
    </section>
  );
}

export default ForgotPassword;
