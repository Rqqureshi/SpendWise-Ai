import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Income() {
  const navigate = useNavigate();

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/incomes/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          data.detail || "Failed to load incomes."
        );
      }

      setIncomes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSource("");
    setAmount("");
    setIncomeDate(
      new Date().toISOString().split("T")[0]
    );
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        source,
        amount: Number(amount),
        income_date: incomeDate,
      };

      const url = editingId
        ? `http://127.0.0.1:8000/incomes/${editingId}`
        : "http://127.0.0.1:8000/incomes/";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save income."
        );
      }

      if (editingId) {
        setSuccess("Income updated successfully.");
      } else {
        setSuccess("Income added successfully.");
      }

      resetForm();
      await fetchIncomes();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (income) => {
    setEditingId(income.id);
    setSource(income.source);
    setAmount(income.amount);
    setIncomeDate(income.income_date);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/incomes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          data.detail || "Failed to delete income."
        );
      }

      setSuccess("Income deleted successfully.");

      await fetchIncomes();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount),
    0
  );

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <nav className="dashboard-navbar">

        <div
          className="dashboard-brand"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
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
          className="income-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* CONTENT */}

      <main className="income-page-content">

        <div className="income-heading">

          <div>
            <span className="dashboard-eyebrow">
              FINANCES
            </span>

            <h1>Income</h1>

            <p>
              Track and manage the money coming into
              your account.
            </p>
          </div>

        </div>


        {/* SUMMARY */}

        <section className="income-summary">

          <div className="income-summary-icon">
            ↗
          </div>

          <div>
            <span>Total recorded income</span>

            <strong>
              ${totalIncome.toFixed(2)}
            </strong>
          </div>

          <div className="income-count">
            {incomes.length}{" "}
            {incomes.length === 1
              ? "record"
              : "records"}
          </div>

        </section>


        {/* MESSAGES */}

        {error && (
          <div className="income-message income-error">
            ⚠ {error}
          </div>
        )}

        {success && (
          <div className="income-message income-success">
            ✓ {success}
          </div>
        )}


        {/* ADD / EDIT FORM */}

        <section className="income-form-panel">

          <div className="income-panel-header">

            <div>
              <span className="panel-eyebrow">
                {editingId
                  ? "EDIT INCOME"
                  : "ADD INCOME"}
              </span>

              <h2>
                {editingId
                  ? "Update income"
                  : "Record new income"}
              </h2>

              <p>
                Enter the details of your income below.
              </p>
            </div>

          </div>


          <form
            className="income-form"
            onSubmit={handleSubmit}
          >

            <div className="income-form-group">

              <label htmlFor="source">
                Source
              </label>

              <input
                id="source"
                type="text"
                placeholder="e.g. Salary, Freelance, Gift"
                value={source}
                onChange={(e) =>
                  setSource(e.target.value)
                }
                maxLength={100}
                required
              />

            </div>


            <div className="income-form-group">

              <label htmlFor="amount">
                Amount
              </label>

              <div className="amount-input">

                <span>$</span>

                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  min="0"
                  step="0.01"
                  required
                />

              </div>

            </div>


            <div className="income-form-group">

              <label htmlFor="incomeDate">
                Date
              </label>

              <input
                id="incomeDate"
                type="date"
                value={incomeDate}
                onChange={(e) =>
                  setIncomeDate(e.target.value)
                }
                required
              />

            </div>


            <div className="income-form-actions">

              {editingId && (
                <button
                  type="button"
                  className="income-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="income-submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update income"
                    : "Add income"}
              </button>

            </div>

          </form>

        </section>


        {/* INCOME LIST */}

        <section className="income-list-panel">

          <div className="income-panel-header">

            <div>
              <span className="panel-eyebrow">
                HISTORY
              </span>

              <h2>
                Income history
              </h2>

              <p>
                All income records associated with
                your account.
              </p>
            </div>

            <span className="income-record-count">
              {incomes.length} records
            </span>

          </div>


          {loading ? (

            <div className="income-loading">
              <div className="loading-spinner"></div>
              <p>Loading income...</p>
            </div>

          ) : incomes.length === 0 ? (

            <div className="income-empty">

              <div className="income-empty-icon">
                ↗
              </div>

              <h3>
                No income recorded yet
              </h3>

              <p>
                Add your first income above to start
                tracking your finances.
              </p>

            </div>

          ) : (

            <div className="income-table-wrapper">

              <table className="income-table">

                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {incomes.map((income) => (

                    <tr key={income.id}>

                      <td>
                        <div className="income-source">

                          <div className="income-row-icon">
                            ↗
                          </div>

                          <div>
                            <strong>
                              {income.source}
                            </strong>

                            <small>
                              Income
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <strong className="income-amount">
                          +${Number(
                            income.amount
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {income.income_date}
                      </td>

                      <td>

                        <div className="income-actions">

                          <button
                            onClick={() =>
                              handleEdit(income)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-income"
                            onClick={() =>
                              handleDelete(income.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Income;