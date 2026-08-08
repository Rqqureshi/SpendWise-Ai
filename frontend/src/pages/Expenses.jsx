import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Expenses() {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [categoryId, setCategoryId] = useState("");

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [expensesResponse, categoriesResponse] =
        await Promise.all([
          fetch("http://127.0.0.1:8000/expenses/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://127.0.0.1:8000/categories/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (
        expensesResponse.status === 401 ||
        categoriesResponse.status === 401
      ) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const expensesData = await expensesResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!expensesResponse.ok) {
        throw new Error(
          expensesData.detail || "Failed to load expenses."
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.detail || "Failed to load categories."
        );
      }

      setExpenses(expensesData);
      setCategories(categoriesData);

      if (
        categoriesData.length > 0 &&
        !categoryId
      ) {
        setCategoryId(String(categoriesData[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setNote("");
    setExpenseDate(
      new Date().toISOString().split("T")[0]
    );
    setCategoryId(
      categories.length > 0
        ? String(categories[0].id)
        : ""
    );
    setEditingId(null);
  };

const handleAddCategory = async () => {
  const name = newCategoryName.trim();

  if (!name) {
    setError("Please enter a category name.");
    return;
  }

  try {
    setError("");
    setSuccess("");
    setAddingCategory(true);

    const response = await fetch(
      "http://127.0.0.1:8000/categories/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type: "expense",
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
        data.detail || "Failed to create category."
      );
    }

    setCategories((current) => [
      ...current,
      data,
    ]);

    setCategoryId(String(data.id));

    setCategorySearch("");
    setNewCategoryName("");
    setShowNewCategory(false);
    setCategoryOpen(false);

    setSuccess("Category created successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 2500);

  } catch (err) {
    setError(err.message);
  } finally {
    setAddingCategory(false);
  }
};

  const filteredCategories = categories.filter((category) =>
  category.name
    .toLowerCase()
    .includes(categorySearch.toLowerCase())
);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!categoryId) {
        throw new Error(
          "Please select an expense category."
        );
      }

      const payload = {
        title,
        amount: Number(amount),
        note: note || null,
        expense_date: expenseDate,
        category_id: Number(categoryId),
      };

      const url = editingId
        ? `http://127.0.0.1:8000/expenses/${editingId}`
        : "http://127.0.0.1:8000/expenses/";

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
          data.detail || "Failed to save expense."
        );
      }

      setSuccess(
        editingId
          ? "Expense updated successfully."
          : "Expense added successfully."
      );

      resetForm();
      await fetchData();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setTitle(expense.title);
    setAmount(expense.amount);
    setNote(expense.note || "");
    setExpenseDate(expense.expense_date);
    setCategoryId(String(expense.category_id));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/expenses/${id}`,
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
          data.detail || "Failed to delete expense."
        );
      }

      setSuccess("Expense deleted successfully.");

      await fetchData();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category
      ? category.name
      : "Unknown category";
  };

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
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

            <h1>Expenses</h1>

            <p>
              Track and manage the money you spend.
            </p>
          </div>

        </div>


        {/* SUMMARY */}

        <section className="income-summary">

          <div className="income-summary-icon expense-summary-icon">
            ↘
          </div>

          <div>
            <span>Total recorded expenses</span>

            <strong>
              ${totalExpenses.toFixed(2)}
            </strong>
          </div>

          <div className="income-count">
            {expenses.length}{" "}
            {expenses.length === 1
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


        {/* FORM */}

        <section className="income-form-panel">

          <div className="income-panel-header">

            <div>
              <span className="panel-eyebrow">
                {editingId
                  ? "EDIT EXPENSE"
                  : "ADD EXPENSE"}
              </span>

              <h2>
                {editingId
                  ? "Update expense"
                  : "Record new expense"}
              </h2>

              <p>
                Enter the details of your expense below.
              </p>
            </div>

          </div>


          <form
            className="income-form"
            onSubmit={handleSubmit}
          >

            {/* TITLE */}

            <div className="income-form-group">

              <label htmlFor="title">
                Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="e.g. Groceries, Rent, Transport"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                maxLength={100}
                required
              />

            </div>


            {/* AMOUNT */}

            <div className="income-form-group">

              <label htmlFor="expenseAmount">
                Amount
              </label>

              <div className="amount-input">

                <span>$</span>

                <input
                  id="expenseAmount"
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


{/* CATEGORY */}

<div className="income-form-group">

  <label>
    Category
  </label>

  <div className="category-selector">

    <input
      type="text"
      value={
        categoryOpen
          ? categorySearch
          : categories.find(
              (category) =>
                String(category.id) === String(categoryId)
            )?.name || ""
      }
      placeholder="Search or select a category..."
      onFocus={() => {
        setCategoryOpen(true);
        setCategorySearch("");
      }}
      onChange={(e) => {
        setCategorySearch(e.target.value);
        setCategoryOpen(true);
      }}
      required={!categoryId}
    />

    {categoryOpen && (
      <div className="category-dropdown">

        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <button
              type="button"
              key={category.id}
              className="category-option"
              onClick={() => {
                setCategoryId(String(category.id));
                setCategorySearch("");
                setCategoryOpen(false);
                setShowNewCategory(false);
              }}
            >
              {category.name}
            </button>
          ))
        ) : (
          <div className="category-no-results">
            No matching category
          </div>
        )}

        <button
          type="button"
          className="category-other-option"
          onClick={() => {
            setCategoryId("");
            setCategoryOpen(false);
            setShowNewCategory(true);
            setNewCategoryName(categorySearch);
          }}
        >
          + Other — Create new category
        </button>

      </div>
    )}

  </div>

  {showNewCategory && (
    <div className="new-category-box">

      <label htmlFor="newCategoryName">
        New category
      </label>

      <div className="new-category-row">

        <input
          id="newCategoryName"
          type="text"
          placeholder="e.g. Medical"
          value={newCategoryName}
          onChange={(e) =>
            setNewCategoryName(e.target.value)
          }
          maxLength={100}
        />

        <button
          type="button"
          onClick={handleAddCategory}
          disabled={addingCategory}
        >
          {addingCategory
            ? "Adding..."
            : "Create"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowNewCategory(false);
            setNewCategoryName("");
          }}
        >
          Cancel
        </button>

      </div>

    </div>
  )}

</div>

            {/* DATE */}

            <div className="income-form-group">

              <label htmlFor="expenseDate">
                Date
              </label>

              <input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) =>
                  setExpenseDate(e.target.value)
                }
                required
              />

            </div>


            {/* NOTE */}

            <div className="income-form-group income-note-group">

              <label htmlFor="note">
                Note
              </label>

              <textarea
                id="note"
                placeholder="Optional note about this expense..."
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                rows="3"
                maxLength={500}
              />

            </div>


            {/* ACTIONS */}

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
                className="income-submit-button expense-submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update expense"
                    : "Add expense"}
              </button>

            </div>

          </form>

        </section>


        {/* EXPENSE HISTORY */}

        <section className="income-list-panel">

          <div className="income-panel-header">

            <div>
              <span className="panel-eyebrow">
                HISTORY
              </span>

              <h2>
                Expense history
              </h2>

              <p>
                All expense records associated with
                your account.
              </p>
            </div>

            <span className="income-record-count">
              {expenses.length} records
            </span>

          </div>


          {loading ? (

            <div className="income-loading">
              <div className="loading-spinner"></div>
              <p>Loading expenses...</p>
            </div>

          ) : expenses.length === 0 ? (

            <div className="income-empty">

              <div className="income-empty-icon expense-empty-icon">
                ↘
              </div>

              <h3>
                No expenses recorded yet
              </h3>

              <p>
                Add your first expense above to start
                tracking your spending.
              </p>

            </div>

          ) : (

            <div className="income-table-wrapper">

              <table className="income-table">

                <thead>

                  <tr>
                    <th>Expense</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {expenses.map((expense) => (

                    <tr key={expense.id}>

                      <td>

                        <div className="income-source">

                          <div className="income-row-icon expense-row-icon">
                            ↘
                          </div>

                          <div>

                            <strong>
                              {expense.title}
                            </strong>

                            <small>
                              {expense.note ||
                                "Expense"}
                            </small>

                          </div>

                        </div>

                      </td>


                      <td>

                        <strong className="expense-amount">
                          -${Number(
                            expense.amount
                          ).toFixed(2)}
                        </strong>

                      </td>


                      <td>

                        <span className="expense-category">
                          {getCategoryName(
                            expense.category_id
                          )}
                        </span>

                      </td>


                      <td>
                        {expense.expense_date}
                      </td>


                      <td>

                        <div className="income-actions">

                          <button
                            onClick={() =>
                              handleEdit(expense)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-income"
                            onClick={() =>
                              handleDelete(expense.id)
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

export default Expenses;