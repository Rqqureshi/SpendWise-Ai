import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/transactions",
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
          data.detail || "Failed to load transactions."
        );
      }

      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
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

        {/* HEADER */}

        <div className="income-heading">

          <div>
            <span className="dashboard-eyebrow">
              FINANCES
            </span>

            <h1>All Transactions</h1>

            <p>
              View all your income and expenses in one place.
            </p>
          </div>

        </div>


        {/* SUMMARY */}

        <section className="income-summary">

          <div className="income-summary-icon">
            #
          </div>

          <div>
            <span>Total transactions</span>

            <strong>
              {transactions.length}
            </strong>
          </div>

          <div className="income-count">
            Income: ${totalIncome.toFixed(2)}
            <br />
            Expenses: ${totalExpenses.toFixed(2)}
          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="income-message income-error">
            ⚠ {error}
          </div>
        )}


        {/* TRANSACTIONS */}

        <section className="income-list-panel">

          <div className="income-panel-header">

            <div>
              <span className="panel-eyebrow">
                HISTORY
              </span>

              <h2>
                Transaction history
              </h2>

              <p>
                All income and expense records associated
                with your account.
              </p>
            </div>

            <span className="income-record-count">
              {transactions.length} records
            </span>

          </div>


          {loading ? (

            <div className="income-loading">
              <div className="loading-spinner"></div>
              <p>Loading transactions...</p>
            </div>

          ) : transactions.length === 0 ? (

            <div className="income-empty">

              <div className="income-empty-icon">
                $
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Add your first income or expense to start
                tracking your finances.
              </p>

              <button
                onClick={() => navigate("/expenses")}
              >
                Add transaction
              </button>

            </div>

          ) : (

            <div className="income-table-wrapper">

              <table className="income-table">

                <thead>

                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {transactions.map((transaction, index) => (

                    <tr
                      key={`${transaction.type}-${transaction.id}-${index}`}
                    >

                      {/* TRANSACTION */}

                      <td>

                        <div className="income-source">

                          <div
                            className={
                              transaction.type === "income"
                                ? "income-row-icon"
                                : "income-row-icon expense-row-icon"
                            }
                          >
                            {transaction.type === "income"
                              ? "↗"
                              : "↘"}
                          </div>

                          <div>

                            <strong>
                              {transaction.title}
                            </strong>

                            <small>
                              {transaction.type === "income"
                                ? "Money received"
                                : "Money spent"}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* TYPE */}

                      <td>

                        <span
                          className={
                            transaction.type === "income"
                              ? "income-type-badge"
                              : "expense-type-badge"
                          }
                        >
                          {transaction.type === "income"
                            ? "Income"
                            : "Expense"}
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td>

                        <strong
                          className={
                            transaction.type === "income"
                              ? "income-amount"
                              : "expense-amount"
                          }
                        >
                          {transaction.type === "income"
                            ? "+"
                            : "-"}
                          $
                          {Number(
                            transaction.amount
                          ).toFixed(2)}
                        </strong>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {transaction.category ? (
                          <span className="expense-category">
                            {transaction.category}
                          </span>
                        ) : (
                          <span>
                            —
                          </span>
                        )}

                      </td>


                      {/* DATE */}

                      <td>
                        {transaction.date}
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

export default Transactions;