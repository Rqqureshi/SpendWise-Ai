import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [categories, setCategories] = useState([]);

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

  const fetchCategories = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/categories/",
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
        data.detail || "Failed to load categories."
      );
    }

    setCategories(data);
  } catch (err) {
    setEditError(err.message);
  }
};

  /* =========================
     SUMMARY
  ========================= */

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

  const balance = totalIncome - totalExpenses;

  /* =========================
     DATE FILTER
  ========================= */

  const isDateMatch = (transactionDate) => {
    if (dateFilter === "all") {
      return true;
    }

    const date = new Date(transactionDate);
    const now = new Date();

    if (dateFilter === "this-month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "last-month") {
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      return (
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear()
      );
    }

    if (dateFilter === "this-year") {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  };

  /* =========================
     FILTERED TRANSACTIONS
  ========================= */

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    /* SEARCH */

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((transaction) => {
        const title =
          transaction.title?.toLowerCase() || "";

        const category =
          transaction.category?.toLowerCase() || "";

        return (
          title.includes(query) ||
          category.includes(query)
        );
      });
    }

    /* TYPE */

    if (typeFilter !== "all") {
      result = result.filter(
        (transaction) =>
          transaction.type === typeFilter
      );
    }

    /* DATE */

    result = result.filter((transaction) =>
      isDateMatch(transaction.date)
    );

    /* SORT */

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.date) -
          new Date(a.date)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.date) -
          new Date(b.date)
        );
      }

      if (sortBy === "highest") {
        return (
          Number(b.amount) -
          Number(a.amount)
        );
      }

      if (sortBy === "lowest") {
        return (
          Number(a.amount) -
          Number(b.amount)
        );
      }

      return 0;
    });

    return result;
  }, [
    transactions,
    search,
    typeFilter,
    dateFilter,
    sortBy,
  ]);

  /* =========================
     EDIT
  ========================= */

  const openEditModal = async (transaction) => {
    try {
      setEditError("");

      if (transaction.type === "income") {
        const response = await fetch(
          `http://127.0.0.1:8000/incomes/${transaction.id}`,
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
            data.detail || "Failed to load income."
          );
        }

        await fetchCategories();

        setEditingTransaction({
          type: "income",
          id: data.id,
          source: data.source,
          amount: data.amount,
          date: data.income_date,
        });
      } else {
        const response = await fetch(
          `http://127.0.0.1:8000/expenses/${transaction.id}`,
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
            data.detail || "Failed to load expense."
          );
        }

        await fetchCategories();

        setEditingTransaction({
          type: "expense",
          id: data.id,
          title: data.title,
          amount: data.amount,
          note: data.note || "",
          date: data.expense_date,
          category_id: data.category_id,
        });
      }
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleEditChange = (field, value) => {
    setEditingTransaction((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editingTransaction) {
      return;
    }

    try {
      setEditLoading(true);
      setEditError("");

      let url = "";
      let body = {};

      if (editingTransaction.type === "income") {
        url = `http://127.0.0.1:8000/incomes/${editingTransaction.id}`;

        body = {
          source: editingTransaction.source,
          amount: Number(editingTransaction.amount),
          income_date: editingTransaction.date,
        };
      } else {
        url = `http://127.0.0.1:8000/expenses/${editingTransaction.id}`;

        body = {
          title: editingTransaction.title,
          amount: Number(editingTransaction.amount),
          note: editingTransaction.note || null,
          expense_date: editingTransaction.date,
          category_id: Number(
            editingTransaction.category_id
          ),
        };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update transaction."
        );
      }

      setEditingTransaction(null);

      await fetchTransactions();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      const endpoint =
        deleteTarget.type === "income"
          ? "incomes"
          : "expenses";

      const response = await fetch(
        `http://127.0.0.1:8000/${endpoint}/${deleteTarget.id}`,
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
          data.detail || "Failed to delete transaction."
        );
      }

      setDeleteTarget(null);

      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /* =========================
     RENDER
  ========================= */

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

        <div className="transactions-page-heading">

          <div>
            <span className="dashboard-eyebrow">
              FINANCES
            </span>

            <h1>
              Transactions
            </h1>

            <p>
              Manage and review all your income and
              expenses in one place.
            </p>
          </div>

          <div className="transactions-header-actions">

            <button
              className="transaction-add-income"
              onClick={() => navigate("/income")}
            >
              + Income
            </button>

            <button
              className="transaction-add-expense"
              onClick={() => navigate("/expenses")}
            >
              + Expense
            </button>

          </div>

        </div>


        {/* SUMMARY */}

        <section className="transaction-summary-grid">

          <div className="transaction-summary-card">

            <div className="transaction-summary-icon total">
              #
            </div>

            <div>
              <span>Total transactions</span>

              <strong>
                {transactions.length}
              </strong>
            </div>

          </div>


          <div className="transaction-summary-card">

            <div className="transaction-summary-icon income">
              ↗
            </div>

            <div>
              <span>Total income</span>

              <strong className="summary-income-value">
                +${totalIncome.toFixed(2)}
              </strong>
            </div>

          </div>


          <div className="transaction-summary-card">

            <div className="transaction-summary-icon expense">
              ↘
            </div>

            <div>
              <span>Total expenses</span>

              <strong className="summary-expense-value">
                -${totalExpenses.toFixed(2)}
              </strong>
            </div>

          </div>


          <div className="transaction-summary-card">

            <div className="transaction-summary-icon balance">
              $
            </div>

            <div>
              <span>Net balance</span>

              <strong
                className={
                  balance >= 0
                    ? "summary-income-value"
                    : "summary-expense-value"
                }
              >
                {balance >= 0 ? "+" : "-"}$
                {Math.abs(balance).toFixed(2)}
              </strong>
            </div>

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="income-message income-error">
            ⚠ {error}
          </div>
        )}


        {/* TRANSACTION PANEL */}

        <section className="income-list-panel">

          <div className="transactions-panel-header">

            <div>
              <span className="panel-eyebrow">
                HISTORY
              </span>

              <h2>
                Transaction history
              </h2>

              <p>
                Search, filter, edit or delete your
                financial records.
              </p>
            </div>

            <span className="income-record-count">
              {filteredTransactions.length} shown
            </span>

          </div>


          {/* FILTERS */}

          <div className="transactions-filters">

            <div className="transaction-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="clear-search"
                >
                  ×
                </button>
              )}

            </div>


            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="all">
                All types
              </option>

              <option value="income">
                Income
              </option>

              <option value="expense">
                Expenses
              </option>
            </select>


            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
            >
              <option value="all">
                All dates
              </option>

              <option value="this-month">
                This month
              </option>

              <option value="last-month">
                Last month
              </option>

              <option value="this-year">
                This year
              </option>
            </select>


            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="highest">
                Highest amount
              </option>

              <option value="lowest">
                Lowest amount
              </option>
            </select>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="income-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading transactions...
              </p>

            </div>

          ) : transactions.length === 0 ? (

            /* NO TRANSACTIONS */

            <div className="income-empty">

              <div className="income-empty-icon">
                $
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Add your first income or expense to
                start tracking your finances.
              </p>

              <div className="empty-transaction-actions">

                <button
                  onClick={() => navigate("/income")}
                >
                  + Add income
                </button>

                <button
                  onClick={() => navigate("/expenses")}
                >
                  + Add expense
                </button>

              </div>

            </div>

          ) : filteredTransactions.length === 0 ? (

            /* NO FILTER RESULTS */

            <div className="transaction-no-results">

              <div className="transaction-no-results-icon">
                ⌕
              </div>

              <h3>
                No matching transactions
              </h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setDateFilter("all");
                  setSortBy("newest");
                }}
              >
                Clear filters
              </button>

            </div>

          ) : (

            /* TABLE */

            <div className="income-table-wrapper">

              <table className="income-table transactions-table">

                <thead>

                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredTransactions.map(
                    (transaction) => (

                      <tr
                        key={`${transaction.type}-${transaction.id}`}
                      >

                        {/* TRANSACTION */}

                        <td>

                          <div className="income-source">

                            <div
                              className={
                                transaction.type ===
                                "income"
                                  ? "income-row-icon"
                                  : "income-row-icon expense-row-icon"
                              }
                            >
                              {transaction.type ===
                              "income"
                                ? "↗"
                                : "↘"}
                            </div>

                            <div>

                              <strong>
                                {transaction.title}
                              </strong>

                              <small>
                                {transaction.type ===
                                "income"
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
                              transaction.type ===
                              "income"
                                ? "income-type-badge"
                                : "expense-type-badge"
                            }
                          >
                            {transaction.type ===
                            "income"
                              ? "Income"
                              : "Expense"}
                          </span>

                        </td>


                        {/* AMOUNT */}

                        <td>

                          <strong
                            className={
                              transaction.type ===
                              "income"
                                ? "income-amount"
                                : "expense-amount"
                            }
                          >
                            {transaction.type ===
                            "income"
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
                            <span>—</span>
                          )}

                        </td>


                        {/* DATE */}

                        <td>
                          {formatDate(
                            transaction.date
                          )}
                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="transaction-row-actions">

                            <button
                              className="transaction-edit-button"
                              onClick={() =>
                                openEditModal(
                                  transaction
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="transaction-delete-button"
                              onClick={() =>
                                setDeleteTarget(
                                  transaction
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>


      {/* EDIT MODAL */}

      {editingTransaction && (

        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !editLoading
            ) {
              setEditingTransaction(null);
            }
          }}
        >

          <div className="transaction-modal">

            <div className="transaction-modal-header">

              <div>

                <span className="panel-eyebrow">
                  {editingTransaction.type ===
                  "income"
                    ? "INCOME"
                    : "EXPENSE"}
                </span>

                <h2>
                  Edit{" "}
                  {editingTransaction.type ===
                  "income"
                    ? "Income"
                    : "Expense"}
                </h2>

              </div>

              <button
                className="transaction-modal-close"
                onClick={() =>
                  !editLoading &&
                  setEditingTransaction(null)
                }
              >
                ×
              </button>

            </div>


            {editError && (
              <div className="income-message income-error">
                ⚠ {editError}
              </div>
            )}


            <form
              onSubmit={saveEdit}
              className="transaction-edit-form"
            >

              {editingTransaction.type ===
              "income" ? (

                <>
                  <div className="transaction-edit-group">

                    <label>
                      Income source
                    </label>

                    <input
                      type="text"
                      value={
                        editingTransaction.source
                      }
                      onChange={(event) =>
                        handleEditChange(
                          "source",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>
                </>

              ) : (

                <div className="transaction-edit-group">

                  <label>
                    Title
                  </label>

                  <input
                    type="text"
                    value={
                      editingTransaction.title
                    }
                    onChange={(event) =>
                      handleEditChange(
                        "title",
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              )}


              <div className="transaction-edit-row">

                <div className="transaction-edit-group">

                  <label>
                    Amount
                  </label>

                  <div className="transaction-edit-amount">

                    <span>$</span>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        editingTransaction.amount
                      }
                      onChange={(event) =>
                        handleEditChange(
                          "amount",
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>


                <div className="transaction-edit-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={
                      editingTransaction.date
                    }
                    onChange={(event) =>
                      handleEditChange(
                        "date",
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {editingTransaction.type ===
                "expense" && (

                <>

<div className="transaction-edit-group">

  <label>Category</label>

  <div className="transaction-category-select-wrapper">
    <select
      className="transaction-category-select"
      value={editingTransaction.category_id || ""}
      onChange={(event) =>
        handleEditChange(
          "category_id",
          Number(event.target.value)
        )
      }
      required
    >
      <option value="" disabled>
        Select category
      </option>

      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>

    <span className="transaction-category-arrow">
      ▾
    </span>

  </div>

</div>


                  <div className="transaction-edit-group">

                    <label>
                      Note
                    </label>

                    <textarea
                      value={
                        editingTransaction.note
                      }
                      onChange={(event) =>
                        handleEditChange(
                          "note",
                          event.target.value
                        )
                      }
                      rows="4"
                    />

                  </div>

                </>
              )}


              <div className="transaction-modal-actions">

                <button
                  type="button"
                  className="transaction-modal-cancel"
                  onClick={() =>
                    !editLoading &&
                    setEditingTransaction(null)
                  }
                  disabled={editLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="transaction-modal-save"
                  disabled={editLoading}
                >
                  {editLoading
                    ? "Saving..."
                    : "Save changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* DELETE MODAL */}

      {deleteTarget && (

        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleteLoading
            ) {
              setDeleteTarget(null);
            }
          }}
        >

          <div className="transaction-delete-modal">

            <div className="transaction-delete-icon">
              !
            </div>

            <h2>
              Delete transaction?
            </h2>

            <p>
              You are about to delete{" "}
              <strong>
                {deleteTarget.title}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="transaction-delete-actions">

              <button
                className="transaction-modal-cancel"
                onClick={() =>
                  !deleteLoading &&
                  setDeleteTarget(null)
                }
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                className="transaction-confirm-delete"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete transaction"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Transactions;