import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [transactionMenuOpen, setTransactionMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [monthlyCashflow, setMonthlyCashflow] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  // =========================
  // DARK / LIGHT MODE
  // =========================

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          transactionsResponse,
          cashflowResponse,
          categoriesResponse,
          userResponse,
        ] = await Promise.all([
          fetch(
            "http://127.0.0.1:8000/dashboard/summary",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/dashboard/transactions",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/dashboard/monthly-cashflow",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/dashboard/expense-categories",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/users/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // =========================
        // AUTH CHECK
        // =========================

        if (
          summaryResponse.status === 401 ||
          transactionsResponse.status === 401 ||
          cashflowResponse.status === 401 ||
          categoriesResponse.status === 401 ||
          userResponse.status === 401
        ) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        // =========================
        // PARSE RESPONSES
        // =========================

        const summaryData =
          await summaryResponse.json();

        const transactionsData =
          await transactionsResponse.json();

        const cashflowData =
          await cashflowResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        const userData =
          await userResponse.json();

        // =========================
        // ERROR CHECKING
        // =========================

        if (!summaryResponse.ok) {
          throw new Error(
            summaryData.detail ||
              "Failed to load dashboard."
          );
        }

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.detail ||
              "Failed to load transactions."
          );
        }

        if (!cashflowResponse.ok) {
          throw new Error(
            cashflowData.detail ||
              "Failed to load monthly cashflow."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.detail ||
              "Failed to load expense categories."
          );
        }

        // =========================
        // STORE DATA
        // =========================

        setSummary(summaryData);
        setUser(userData);

        // Show only the 5 most recent transactions
        setTransactions(
          transactionsData.slice(0, 5)
        );

        // Store analytics data
        setMonthlyCashflow(cashflowData);
        setExpenseCategories(categoriesData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // =========================
  // THEME TOGGLE
  // =========================

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

    // =========================
  // CHART STYLING
  // =========================

  const chartColors = {
    income: "#22c55e",
    expense: "#ef4444",

    pie: [
      "#6366f1",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#14b8a6",
      "#3b82f6",
      "#f97316",
      "#06b6d4",
    ],

    grid: darkMode ? "#334155" : "#e2e8f0",
    axis: darkMode ? "#94a3b8" : "#64748b",
    text: darkMode ? "#e2e8f0" : "#334155",

    tooltipBackground: darkMode ? "#111827" : "#ffffff",
    tooltipBorder: darkMode ? "#334155" : "#e2e8f0",
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">
          !
        </div>

        <h2>
          Unable to load dashboard
        </h2>

        <p>
          {error}
        </p>

        <button onClick={handleLogout}>
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

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

        <div className="navbar-actions">

          {/* THEME TOGGLE */}

          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            <span className="theme-icon">
              {darkMode ? "☀" : "☾"}
            </span>

            <span>
              {darkMode ? "Light" : "Dark"}
            </span>
          </button>

          {/* PROFILE */}

          <div className="profile-wrapper">

            <button
              className="profile-button"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
            >

              <div className="profile-avatar">
                {user?.profile_picture ? (
                  <img
                    src={`http://127.0.0.1:8000${user.profile_picture}`}
                    alt={user.full_name}
                  />
                ) : (
                  "U"
                )}
              </div>

              <div className="profile-info">

                <span className="profile-name">
                  {user?.full_name || "Account"}
                </span>

                <span className="profile-role">
                  Personal Finance
                </span>

              </div>

              <span
                className={`profile-arrow ${
                  profileOpen ? "open" : ""
                }`}
              >
                ▾
              </span>

            </button>

            {profileOpen && (

              <div className="profile-menu">

                <button
                  onClick={() =>
                    navigate("/profile")
                  }
                >
                  <span>
                    👤
                  </span>

                  <div>
                    <strong>
                      Profile
                    </strong>

                    <small>
                      View your profile
                    </small>
                  </div>
                </button>

                <button
                  onClick={() =>
                    navigate("/settings")
                  }
                >
                  <span>
                    ⚙
                  </span>

                  <div>
                    <strong>
                      Settings
                    </strong>

                    <small>
                      Manage your account
                    </small>
                  </div>
                </button>

                <div className="menu-divider" />

                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <span>
                    ↪
                  </span>

                  <div>
                    <strong>
                      Logout
                    </strong>

                    <small>
                      Sign out of SpendWise
                    </small>
                  </div>
                </button>

              </div>

            )}

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-content">

        {/* HEADER */}

        <div className="dashboard-heading">

          <div>

            <span className="dashboard-eyebrow">
              OVERVIEW
            </span>

            <h1>
              Dashboard
            </h1>

            <p>
              Here's an overview of your finances.
            </p>

          </div>

          {/* ADD TRANSACTION */}

          <div className="add-transaction-wrapper">

            <button
              className="add-transaction-button"
              onClick={() =>
                setTransactionMenuOpen(
                  !transactionMenuOpen
                )
              }
            >
              <span>
                +
              </span>

              Add transaction

              <span className="transaction-chevron">
                ▾
              </span>
            </button>

            {transactionMenuOpen && (

              <div className="transaction-menu">

                <button
                  onClick={() =>
                    navigate("/income")
                  }
                >
                  <span className="transaction-menu-icon income">
                    ↗
                  </span>

                  <div>
                    <strong>
                      Add income
                    </strong>

                    <small>
                      Record money received
                    </small>
                  </div>
                </button>

                <button
                  onClick={() =>
                    navigate("/expenses")
                  }
                >
                  <span className="transaction-menu-icon expense">
                    ↘
                  </span>

                  <div>
                    <strong>
                      Add expense
                    </strong>

                    <small>
                      Record money spent
                    </small>
                  </div>
                </button>

              </div>

            )}

          </div>

        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <section className="summary-grid">

          <div className="summary-card income-card">

            <div className="summary-card-top">

              <div className="summary-card-icon">
                ↗
              </div>

              <span className="summary-label">
                Total Income
              </span>

            </div>

            <h2>
              $
              {Number(
                summary.total_income
              ).toFixed(2)}
            </h2>

            <p className="summary-description">
              Money coming in
            </p>

          </div>

          <div className="summary-card expense-card">

            <div className="summary-card-top">

              <div className="summary-card-icon">
                ↘
              </div>

              <span className="summary-label">
                Total Expenses
              </span>

            </div>

            <h2>
              $
              {Number(
                summary.total_expenses
              ).toFixed(2)}
            </h2>

            <p className="summary-description">
              Money going out
            </p>

          </div>

          <div className="summary-card balance-card">

            <div className="summary-card-top">

              <div className="summary-card-icon">
                $
              </div>

              <span className="summary-label">
                Current Balance
              </span>

            </div>

            <h2>
              $
              {Number(
                summary.balance
              ).toFixed(2)}
            </h2>

            <p className="summary-description">
              Income minus expenses
            </p>

          </div>

          <div className="summary-card transaction-card">

            <div className="summary-card-top">

              <div className="summary-card-icon">
                #
              </div>

              <span className="summary-label">
                Transactions
              </span>

            </div>

            <h2>
              {summary.total_transactions}
            </h2>

            <p className="summary-description">
              Total recorded transactions
            </p>

          </div>

        </section>

        {/* =========================
            MAIN DASHBOARD GRID
        ========================= */}

        <section className="dashboard-grid">

          {/* FINANCIAL OVERVIEW */}

          <div className="dashboard-panel financial-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  ANALYTICS
                </span>

                <h2>
                  Financial overview
                </h2>

                <p>
                  Track your income and expenses over time.
                </p>

              </div>

              <button
                className="panel-action"
                onClick={() =>
                  navigate("/reports")
                }
              >
                View reports
              </button>

            </div>

<div className="financial-charts">

  {/* =========================
      MONTHLY CASHFLOW CHART
  ========================= */}

  <div className="chart-container">

    <div className="chart-title">
      <h3>Income vs Expenses</h3>
      <p>Monthly cashflow overview</p>
    </div>

    {monthlyCashflow.length === 0 ? (

      <div className="chart-empty">
        <div>📊</div>
        <p>No cashflow data available yet.</p>
      </div>

    ) : (

      <ResponsiveContainer width="100%" height={300}>

        <BarChart
          data={monthlyCashflow}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            stroke={chartColors.grid}
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{
              fontSize: 12,
              fill: chartColors.axis,
            }}
            axisLine={{
              stroke: chartColors.grid,
            }}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 12,
              fill: chartColors.axis,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBackground,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: "10px",
              color: chartColors.text,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
            labelStyle={{
              color: chartColors.text,
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: chartColors.text,
            }}
            formatter={(value) =>
              `$${Number(value).toFixed(2)}`
            }
          />

          <Legend
            wrapperStyle={{
              color: chartColors.text,
              fontSize: "13px",
              paddingTop: "10px",
            }}
          />

          <Bar
            dataKey="income"
            name="Income"
            fill={chartColors.income}
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />

          <Bar
            dataKey="expenses"
            name="Expenses"
            fill={chartColors.expense}
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />

        </BarChart>

      </ResponsiveContainer>
    )}

  </div>


  {/* =========================
      EXPENSE CATEGORY CHART
  ========================= */}

  <div className="chart-container">

    <div className="chart-title">
      <h3>Expense Breakdown</h3>
      <p>Where your money is going</p>
    </div>

    {expenseCategories.length === 0 ? (

      <div className="chart-empty">
        <div>🥧</div>
        <p>No expense category data available yet.</p>
      </div>

    ) : (

      <ResponsiveContainer width="100%" height={300}>

        <PieChart>

          <Pie
            data={expenseCategories}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={45}
            paddingAngle={3}
            label={({ category, amount }) =>
              `${category}: $${Number(amount).toFixed(0)}`
            }
            labelLine={{
              stroke: chartColors.axis,
            }}
          >

            {expenseCategories.map((entry, index) => (

              <Cell
                key={`cell-${index}`}
                fill={
                  chartColors.pie[
                    index % chartColors.pie.length
                  ]
                }
                stroke={
                  darkMode
                    ? "#1e293b"
                    : "#ffffff"
                }
                strokeWidth={2}
              />

            ))}

          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBackground,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: "10px",
              color: chartColors.text,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
            labelStyle={{
              color: chartColors.text,
              fontWeight: 600,
            }}
            itemStyle={{
              color: chartColors.text,
            }}
            formatter={(value) =>
              `$${Number(value).toFixed(2)}`
            }
          />

          <Legend
            wrapperStyle={{
              color: chartColors.text,
              fontSize: "13px",
              paddingTop: "10px",
            }}
          />

        </PieChart>

      </ResponsiveContainer>
    )}

  </div>

</div>

            </div>

          {/* AI ASSISTANT */}

          <div className="dashboard-panel ai-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  AI POWERED
                </span>

                <h2>
                  AI Assistant
                </h2>

                <p>
                  Your personal financial assistant.
                </p>

              </div>

              <div className="ai-status">
                <span></span>
                Ready
              </div>

            </div>

            <div className="ai-placeholder">

              <div className="ai-icon">
                ✦
              </div>

              <h3>
                Ask SpendWise AI
              </h3>

              <p>
                Get personalized insights about your
                spending, income, savings and financial goals.
              </p>

              <button
                className="ai-button"
                onClick={() =>
                  navigate("/ai")
                }
              >
                Start conversation

                <span>
                  →
                </span>
              </button>

            </div>

          </div>

          {/* RECENT TRANSACTIONS */}

          <div className="dashboard-panel transactions-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  ACTIVITY
                </span>

                <h2>
                  Recent transactions
                </h2>

                <p>
                  Your latest financial activity.
                </p>

              </div>

              <button
                className="panel-action"
                onClick={() =>
                  navigate("/transactions")
                }
              >
                View all
              </button>

            </div>

            {transactions.length === 0 ? (

              <div className="empty-transactions">

                <div className="transaction-empty-icon">
                  $
                </div>

                <h3>
                  No recent transactions
                </h3>

                <p>
                  Add your first income or expense to
                  start tracking your finances.
                </p>

                <button
                  onClick={() =>
                    navigate("/transactions")
                  }
                >
                  View transactions
                </button>

              </div>

            ) : (

              <div className="recent-transactions-list">

                {transactions.map(
                  (transaction, index) => (

                    <div
                      className="recent-transaction"
                      key={`${transaction.type}-${transaction.id}-${index}`}
                    >

                      <div
                        className={
                          transaction.type === "income"
                            ? "recent-transaction-icon income"
                            : "recent-transaction-icon expense"
                        }
                      >
                        {transaction.type === "income"
                          ? "↗"
                          : "↘"}
                      </div>

                      <div className="recent-transaction-info">

                        <strong>
                          {transaction.title}
                        </strong>

                        <small>
                          {transaction.category ||
                            transaction.type}

                          {" • "}

                          {transaction.date}
                        </small>

                      </div>

                      <strong
                        className={
                          transaction.type === "income"
                            ? "recent-transaction-amount income"
                            : "recent-transaction-amount expense"
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

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* QUICK ACTIONS */}

          <div className="dashboard-panel quick-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  QUICK ACTIONS
                </span>

                <h2>
                  Manage finances
                </h2>

              </div>

            </div>

            <div className="quick-actions">

              <button
                onClick={() =>
                  navigate("/income")
                }
              >

                <span className="quick-icon income">
                  ↗
                </span>

                <div>

                  <strong>
                    Add income
                  </strong>

                  <small>
                    Record money received
                  </small>

                </div>

                <span className="quick-arrow">
                  →
                </span>

              </button>

              <button
                onClick={() =>
                  navigate("/expenses")
                }
              >

                <span className="quick-icon expense">
                  ↘
                </span>

                <div>

                  <strong>
                    Add expense
                  </strong>

                  <small>
                    Record money spent
                  </small>

                </div>

                <span className="quick-arrow">
                  →
                </span>

              </button>

              <button
                onClick={() =>
                  navigate("/reports")
                }
              >

                <span className="quick-icon report">
                  ◫
                </span>

                <div>

                  <strong>
                    View reports
                  </strong>

                  <small>
                    Analyze your finances
                  </small>

                </div>

                <span className="quick-arrow">
                  →
                </span>

              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;