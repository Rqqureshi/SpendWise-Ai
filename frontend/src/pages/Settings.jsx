import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "http://127.0.0.1:8000/users/me/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Password changed successfully."
      );
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="settings-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            S
          </div>

          <div>
            <span className="brand-name">
              SpendWise AI
            </span>

            <span className="brand-subtitle">
              Personal Finance
            </span>
          </div>

        </div>

        <button
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* =========================
          CONTENT
      ========================= */}

      <main className="settings-content">

        <div className="settings-heading">

          <span className="dashboard-eyebrow">
            ACCOUNT
          </span>

          <h1>Settings</h1>

          <p>
            Manage your account, security and preferences.
          </p>

        </div>


        {/* =========================
            ACCOUNT SETTINGS
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div>
              <h2>Account settings</h2>

              <p>
                Manage your personal account information.
              </p>
            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>Profile</strong>

              <p>
                Update your name, email and profile picture.
              </p>
            </div>

            <button
              type="button"
              className="settings-action-button"
              onClick={() => navigate("/profile")}
            >
              Manage profile
            </button>

          </div>

        </section>


        {/* =========================
            PASSWORD
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div>
              <h2>Password & security</h2>

              <p>
                Change your account password.
              </p>
            </div>

          </div>

          {passwordError && (
            <div className="profile-message error">
              ⚠ {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="profile-message success">
              ✓ {passwordSuccess}
            </div>
          )}

          <form
            className="settings-password-form"
            onSubmit={handlePasswordChange}
          >

            <div className="profile-form-group">

              <label>
                Current password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                required
              />

            </div>


            <div className="profile-form-group">

              <label>
                New password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />

            </div>


            <div className="profile-form-group">

              <label>
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

            </div>

            <div className="settings-form-actions">

              <button
                type="submit"
                className="profile-save-button"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing password..."
                  : "Change password"}
              </button>

            </div>

          </form>

        </section>


        {/* =========================
            PREFERENCES
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div>
              <h2>Preferences</h2>

              <p>
                Customize how SpendWise looks.
              </p>
            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>Appearance</strong>

              <p>
                Choose between light and dark mode.
              </p>
            </div>

            <button
              type="button"
              className="settings-theme-button"
              onClick={toggleTheme}
            >
              {theme === "dark"
                ? "☀ Light mode"
                : "🌙 Dark mode"}
            </button>

          </div>

        </section>


        {/* =========================
            SESSION
        ========================= */}

        <section className="settings-card settings-danger-card">

          <div className="settings-card-header">

            <div>
              <h2>Session</h2>

              <p>
                Sign out of your SpendWise account.
              </p>
            </div>

          </div>

          <div className="settings-row">

            <div>
              <strong>Logout</strong>

              <p>
                You will need to sign in again to access your account.
              </p>
            </div>

            <button
              type="button"
              className="settings-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Settings;