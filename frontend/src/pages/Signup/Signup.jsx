import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    street: "",
    state: "",
    city: "",
    zipcode: "",
  });

  const [message, setMessage] = useState("");

  const submitForm = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.includes("@") || form.password.length < 6 || form.password !== form.confirmPassword || !form.street.trim() || !form.state.trim() || !form.city.trim() || !form.zipcode.trim()) {
      setMessage("Please fill all fields with valid details.");
      return;
    }

    setMessage("Demo account created successfully.");
  };

  return (
    <section className="auth-page signup-page">
      <form className="auth-card" onSubmit={submitForm}>
        <span className="auth-logo">ElectraX</span>

        <h1>Create account</h1>
        <p>Join ElectraX for faster checkout and exclusive drops.</p>

        <div className="form-row">
          <label> Full Name
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Carter" />
          </label>

          <label> Phone Number
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </label>
        </div>

        <label> Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>

        <div className="form-row">
          <label> Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </label>

          <label> Confirm Password
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" />
          </label>
        </div>

        <div className="address-title">Address Details</div>

        <div className="form-row">
          <label> Street
            <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="221B Tech Street" />
          </label>

          <label> State
            <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Rajasthan" />
          </label>
        </div>

        <div className="form-row">
          <label> City
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Jaipur" />
          </label>

          <label> Zipcode
            <input type="text" value={form.zipcode} onChange={(e) => setForm({ ...form, zipcode: e.target.value })} placeholder="302001" />
          </label>
        </div>

        {message && <div className="auth-message">{message}</div>}

        <button className="primary-btn">Signup</button>

        <div className="social-login">
          <button type="button"> <FiMail /> Google </button>
        </div>

        <small>Already have an account? <Link to="/login">Login</Link></small>
      </form>
    </section>
  );
}

export default Signup;
