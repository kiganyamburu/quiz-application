import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(
        response?.message ||
          "If an account exists for this email, a reset link has been sent.",
      );
      setEmail("");
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "Password reset is not enabled on the server yet. Contact support or try again later.",
        );
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Unable to process your request right now. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you reset instructions.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered your password? <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
