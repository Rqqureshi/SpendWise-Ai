import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { theme, toggleTheme } = useTheme();

  <button
  type="button"
  className="auth-theme-toggle"
  onClick={toggleTheme}
  aria-label="Toggle theme"
>
  {theme === "dark" ? "☀️" : "🌙"}
  </button>

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    setAttempted(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard");
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

          <h1>Welcome back</h1>

          <p>
            Sign in to your SpendWise AI account
          </p>
        </div>

        {error && (
          <div className="auth-warning">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>

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

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={20} strokeWidth={1.5} />
            ) : (
              <Eye size={20} strokeWidth={1.5} />
            )}
          </button>
            </div>
          </div>

          {attempted && error && (
            <div className="forgot-password">
              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>

          <Link to="/register">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;