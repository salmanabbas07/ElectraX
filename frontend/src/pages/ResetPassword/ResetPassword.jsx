import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import "../Login/Login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        password: form.password,
      });
      setMessage(response.data.message || "Password reset successful! Redirecting to login...");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password. Link may be invalid or expired.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-logo">ElectraX</span>

        <h1>Reset Password</h1>
        <p>Set your new secure password.</p>

        {!isSuccess && (
          <>
            <label> New Password
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  placeholder="At least 8 characters" 
                  required 
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

            <label> Confirm New Password
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={form.confirmPassword} 
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
                  placeholder="Confirm new password" 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-icon" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>
          </>
        )}

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        {!isSuccess && (
          <button className="primary-btn" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        )}

        <small style={{ marginTop: "18px", display: "block" }}>
          Back to <Link to="/login">Login</Link>
        </small>
      </form>
    </section>
  );
}

export default ResetPassword;
