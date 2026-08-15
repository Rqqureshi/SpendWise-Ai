import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  

  // =========================
  // THEME
  // =========================

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );
  }, [darkMode]);

  // =========================
  // FETCH CURRENT USER
  // =========================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(
        "access_token"
      );

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load profile."
          );
        }

        setUser(data);

        setFullName(data.full_name);
        setEmail(data.email);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // =========================
  // EDIT
  // =========================

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setFullName(user.full_name);
    setEmail(user.email);

    setEditing(true);
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    setFullName(user.full_name);
    setEmail(user.email);

    setError("");
    setSuccess("");

    setEditing(false);
  };

  // =========================
  // SAVE
  // =========================

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    const token = localStorage.getItem(
      "access_token"
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/users/me",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            full_name: fullName,
            email: email,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update profile."
        );
      }

      setUser(data);

      setFullName(data.full_name);
      setEmail(data.email);

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // INITIALS
  // =========================

  const handleProfilePictureChange = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError("Only JPG, PNG, and WebP images are allowed.");
    return;
  }

  const token = localStorage.getItem("access_token");

  const formData = new FormData();
  formData.append("file", file);

  try {
    setUploadingPhoto(true);
    setError("");
    setSuccess("");

    const response = await fetch(
      "http://127.0.0.1:8000/users/me/profile-picture",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
        data.detail || "Failed to upload profile picture."
      );
    }

    setUser((currentUser) => ({
      ...currentUser,
      profile_picture: data.profile_picture,
    }));

    // Notify other pages (dashboard) about profile update
    try {
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: data.profile_picture }));
    } catch (err) {
      // ignore in non-browser environments
    }

    setSuccess("Profile picture updated successfully.");
  } catch (err) {
    setError(err.message);
  } finally {
    setUploadingPhoto(false);

    // Allows selecting the same file again
    e.target.value = "";
  }
};

  // =========================
  // INITIALS
  // =========================

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>

        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">

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

      <main className="profile-content">

        <div className="profile-heading">

          <span className="dashboard-eyebrow">
            ACCOUNT
          </span>

          <h1>Profile</h1>

          <p>
            Manage your personal account
            information.
          </p>

        </div>


        {/* =========================
            PROFILE CARD
        ========================= */}

        <section className="profile-card">

          <div className="profile-card-header">

          <div className="profile-avatar-container">

          {user?.profile_picture ? (
            <img
              src={`http://127.0.0.1:8000${user.profile_picture}`}
              alt={user?.full_name || "Profile"}
              className="profile-large-avatar-image"
            />
          ) : (
            <div className="profile-large-avatar">
              {getInitials(user?.full_name)}
            </div>
          )}

          <label
            className="profile-change-photo"
            htmlFor="profile-picture-input"
          >
            {uploadingPhoto ? "Uploading..." : "Change photo"}
          </label>

          <input
            id="profile-picture-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleProfilePictureChange}
            hidden
            disabled={uploadingPhoto}
          />

        </div>

            <div>
              <h2>
                {user?.full_name}
              </h2>

              <p>
                {user?.email}
              </p>
            </div>

          </div>


          {error && (
            <div className="profile-message error">
              ⚠ {error}
            </div>
          )}


          {success && (
            <div className="profile-message success">
              ✓ {success}
            </div>
          )}


          <form onSubmit={handleSave}>

            <div className="profile-section">

              <div className="profile-section-heading">
                <h3>
                  Personal information
                </h3>

                <p>
                  Your basic account information.
                </p>
              </div>


              <div className="profile-form-grid">

                <div className="profile-form-group">

                  <label>
                    Full name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    required
                  />

                </div>


                <div className="profile-form-group">

                  <label>
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    required
                  />

                </div>

              </div>

            </div>


            {/* =========================
                ACCOUNT INFORMATION
            ========================= */}

            <div className="profile-section">

              <div className="profile-section-heading">
                <h3>
                  Account information
                </h3>

                <p>
                  Information about your
                  SpendWise account.
                </p>
              </div>


              <div className="profile-account-info">

                <div>
                  <span>
                    User ID
                  </span>

                  <strong>
                    #{user?.id}
                  </strong>
                </div>


                <div>
                  <span>
                    Account type
                  </span>

                  <strong>
                    Personal
                  </strong>
                </div>

              </div>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="profile-actions">

              {!editing ? (

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  Edit profile
                </button>

              ) : (

                <>
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </>

              )}

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default Profile;