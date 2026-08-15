import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setResetToken("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to process password reset request."
        );
      }

      setSuccess(data.message || "Password reset token generated.");

      // Development/testing only.
      // Later this will be replaced by an email reset link.
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
  

      <div className="auth-card">

        <div className="auth-header">
          <div className="logo-mark">S</div>

          <h1>Forgot password?</h1>

          <p>
            Enter your email address and we'll help you reset your password.
          </p>
        </div>

        {error && (
          <div className="auth-warning">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleForgotPassword}>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send reset instructions"}
          </button>

        </form>

        {resetToken && (
          <div className="reset-token-box">
            <strong>Development Reset Token</strong>

            <p>
              This is temporary. Later we will send the reset link by email.
            </p>

            <code>
              {resetToken}
            </code>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/reset-password?token=${encodeURIComponent(resetToken)}`
                )
              }
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        <div className="auth-footer">
          <span>Remember your password?</span>

          <Link to="/login">
            Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;