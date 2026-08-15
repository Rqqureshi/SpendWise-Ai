import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [monthlyCashflow, setMonthlyCashflow] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH REPORT DATA
  // =========================

  useEffect(() => {
    const fetchReportData = async () => {
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
          cashflowResponse,
          categoriesResponse,
          transactionsResponse,
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
            "http://127.0.0.1:8000/dashboard/transactions",
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
          cashflowResponse.status === 401 ||
          categoriesResponse.status === 401 ||
          transactionsResponse.status === 401
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

        const cashflowData =
          await cashflowResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        const transactionsData =
          await transactionsResponse.json();

        // =========================
        // ERROR CHECKING
        // =========================

        if (!summaryResponse.ok) {
          throw new Error(
            summaryData.detail ||
              "Failed to load financial summary."
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

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.detail ||
              "Failed to load transactions."
          );
        }

        // =========================
        // STORE DATA
        // =========================

        setSummary(summaryData);
        setMonthlyCashflow(cashflowData);
        setExpenseCategories(categoriesData);
        setTransactions(transactionsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [navigate]);

  // =========================
  // CALCULATED REPORT DATA
  // =========================

  const reportStats = useMemo(() => {
    if (!summary) {
      return {
        netCashflow: 0,
        highestExpenseCategory: null,
        highestIncomeMonth: null,
        highestExpenseMonth: null,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
      };
    }

    const netCashflow =
      Number(summary.total_income) -
      Number(summary.total_expenses);

    // =========================
    // HIGHEST EXPENSE CATEGORY
    // =========================

    const highestExpenseCategory =
      expenseCategories.length > 0
        ? expenseCategories.reduce(
            (highest, current) =>
              Number(current.amount) >
              Number(highest.amount)
                ? current
                : highest
          )
        : null;

    // =========================
    // HIGHEST INCOME MONTH
    // =========================

    const highestIncomeMonth =
      monthlyCashflow.length > 0
        ? monthlyCashflow.reduce(
            (highest, current) =>
              Number(current.income) >
              Number(highest.income)
                ? current
                : highest
          )
        : null;

    // =========================
    // HIGHEST EXPENSE MONTH
    // =========================

    const highestExpenseMonth =
      monthlyCashflow.length > 0
        ? monthlyCashflow.reduce(
            (highest, current) =>
              Number(current.expenses) >
              Number(highest.expenses)
                ? current
                : highest
          )
        : null;

    // =========================
    // AVERAGE MONTHLY INCOME
    // =========================

    const averageMonthlyIncome =
      monthlyCashflow.length > 0
        ? monthlyCashflow.reduce(
            (total, month) =>
              total + Number(month.income),
            0
          ) / monthlyCashflow.length
        : 0;

    // =========================
    // AVERAGE MONTHLY EXPENSES
    // =========================

    const averageMonthlyExpenses =
      monthlyCashflow.length > 0
        ? monthlyCashflow.reduce(
            (total, month) =>
              total + Number(month.expenses),
            0
          ) / monthlyCashflow.length
        : 0;

    return {
      netCashflow,
      highestExpenseCategory,
      highestIncomeMonth,
      highestExpenseMonth,
      averageMonthlyIncome,
      averageMonthlyExpenses,
    };
  }, [
    summary,
    monthlyCashflow,
    expenseCategories,
  ]);

  // =========================
  // MONTHLY REPORT TABLE
  // =========================

  const monthlyReport = useMemo(() => {
    return monthlyCashflow.map((month) => ({
      month: month.month,
      income: Number(month.income),
      expenses: Number(month.expenses),
      net:
        Number(month.income) -
        Number(month.expenses),
    }));
  }, [monthlyCashflow]);

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <h2>Loading financial report...</h2>
      </div>
    );
  }

  // =========================
  // EXPORT CSV
  // =========================

  const exportCSV = () => {
    const rows = [];

    // Report summary
    rows.push(["FINANCIAL REPORT"]);
    rows.push([]);

    rows.push(["Financial Overview"]);
    rows.push(["Total Income", summary.total_income]);
    rows.push(["Total Expenses", summary.total_expenses]);
    rows.push(["Current Balance", summary.balance]);
    rows.push(["Total Transactions", summary.total_transactions]);
    rows.push([]);

    // Monthly cash flow
    rows.push(["Monthly Cash Flow"]);
    rows.push([
      "Month",
      "Income",
      "Expenses",
      "Net Cash Flow",
    ]);

    monthlyReport.forEach((month) => {
      rows.push([
        month.month,
        month.income,
        month.expenses,
        month.net,
      ]);
    });

    rows.push([]);

    // Expense categories
    rows.push(["Expense Breakdown"]);
    rows.push(["Category", "Amount"]);

    expenseCategories.forEach((category) => {
      rows.push([
        category.category,
        category.amount,
      ]);
    });

    rows.push([]);

    // Transactions
    rows.push(["Transactions"]);
    rows.push([
      "Date",
      "Type",
      "Description",
      "Category",
      "Amount",
    ]);

    transactions.forEach((transaction) => {
      rows.push([
        transaction.date,
        transaction.type,
        transaction.title,
        transaction.category || "",
        transaction.type === "income"
          ? Number(transaction.amount)
          : -Number(transaction.amount),
      ]);
    });

    // Convert rows to CSV
    const csvContent = rows
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(
              value ?? ""
            );

            // Escape quotes and commas
            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue.replace(
                /"/g,
                '""'
              )}"`;
            }

            return stringValue;
          })
          .join(",")
      )
      .join("\n");

    // Create downloadable file
    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const date = new Date()
      .toISOString()
      .split("T")[0];

    link.download = `SpendWise-Financial-Report-${date}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // =========================
  // PRINT / SAVE AS PDF
  // =========================

  const exportPDF = () => {
    window.print();
  };

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div>
        <h2>Unable to load report</h2>

        <p>{error}</p>

        <button
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* =========================
          HEADER
      ========================= */}

      <header>
        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <span>FINANCIAL REPORT</span>

        <h1>Financial Reports</h1>

        <p>
          Analyze your income, expenses,
          cash flow and spending patterns.
        </p>

        <div className="report-export-actions">

            <button
            type="button"
            onClick={exportCSV}
            >
            Export CSV
            </button>

            <button
            type="button"
            onClick={exportPDF}
            >
            Print / Save as PDF
            </button>

        </div>
      </header>


      {/* =========================
          SUMMARY
      ========================= */}

      <section>

        <h2>Financial Overview</h2>

        <div>

          <div>
            <span>Total Income</span>
            <strong>
              {formatCurrency(
                summary.total_income
              )}
            </strong>
          </div>

          <div>
            <span>Total Expenses</span>
            <strong>
              {formatCurrency(
                summary.total_expenses
              )}
            </strong>
          </div>

          <div>
            <span>Current Balance</span>
            <strong>
              {formatCurrency(
                summary.balance
              )}
            </strong>
          </div>

          <div>
            <span>Total Transactions</span>
            <strong>
              {summary.total_transactions}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          CASH FLOW
      ========================= */}

      <section>

        <h2>Monthly Cash Flow</h2>

        <p>
          Income, expenses and net cash flow
          for each recorded month.
        </p>

        {monthlyReport.length === 0 ? (

          <p>
            No monthly financial data available.
          </p>

        ) : (

          <div>

            {monthlyReport.map((month) => (

              <div key={month.month}>

                <strong>
                  {month.month}
                </strong>

                <span>
                  Income:{" "}
                  {formatCurrency(month.income)}
                </span>

                <span>
                  Expenses:{" "}
                  {formatCurrency(month.expenses)}
                </span>

                <span>
                  Net:{" "}
                  {formatCurrency(month.net)}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =========================
          EXPENSE BREAKDOWN
      ========================= */}

      <section>

        <h2>Expense Breakdown</h2>

        <p>
          How your total expenses are distributed
          across categories.
        </p>

        {expenseCategories.length === 0 ? (

          <p>
            No expense category data available.
          </p>

        ) : (

          <div>

            {expenseCategories.map(
              (category) => (

                <div key={category.category}>

                  <strong>
                    {category.category}
                  </strong>

                  <span>
                    {formatCurrency(
                      category.amount
                    )}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =========================
          FINANCIAL INSIGHTS
      ========================= */}

      <section>

        <h2>Financial Insights</h2>

        <div>

          <div>
            <span>Net Cash Flow</span>

            <strong>
              {formatCurrency(
                reportStats.netCashflow
              )}
            </strong>
          </div>


          <div>
            <span>
              Highest Expense Category
            </span>

            <strong>
              {reportStats
                .highestExpenseCategory
                ?.category || "N/A"}
            </strong>

            {reportStats
              .highestExpenseCategory && (
              <small>
                {formatCurrency(
                  reportStats
                    .highestExpenseCategory
                    .amount
                )}
              </small>
            )}
          </div>


          <div>
            <span>
              Highest Income Month
            </span>

            <strong>
              {reportStats
                .highestIncomeMonth
                ?.month || "N/A"}
            </strong>

            {reportStats
              .highestIncomeMonth && (
              <small>
                {formatCurrency(
                  reportStats
                    .highestIncomeMonth
                    .income
                )}
              </small>
            )}
          </div>


          <div>
            <span>
              Highest Expense Month
            </span>

            <strong>
              {reportStats
                .highestExpenseMonth
                ?.month || "N/A"}
            </strong>

            {reportStats
              .highestExpenseMonth && (
              <small>
                {formatCurrency(
                  reportStats
                    .highestExpenseMonth
                    .expenses
                )}
              </small>
            )}
          </div>


          <div>
            <span>
              Average Monthly Income
            </span>

            <strong>
              {formatCurrency(
                reportStats.averageMonthlyIncome
              )}
            </strong>
          </div>


          <div>
            <span>
              Average Monthly Expenses
            </span>

            <strong>
              {formatCurrency(
                reportStats.averageMonthlyExpenses
              )}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          MONTHLY REPORT TABLE
      ========================= */}

      <section>

        <h2>Monthly Report</h2>

        {monthlyReport.length === 0 ? (

          <p>No monthly data available.</p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net Cash Flow</th>
              </tr>

            </thead>

            <tbody>

              {monthlyReport.map(
                (month) => (

                  <tr key={month.month}>

                    <td>
                      {month.month}
                    </td>

                    <td>
                      {formatCurrency(
                        month.income
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        month.expenses
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        month.net
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </section>


      {/* =========================
          TRANSACTIONS
      ========================= */}

      <section>

        <h2>Transactions</h2>

        <p>
          All recorded income and expenses.
        </p>

        {transactions.length === 0 ? (

          <p>
            No transactions recorded yet.
          </p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>

            </thead>

            <tbody>

              {transactions.map(
                (transaction, index) => (

                  <tr
                    key={`${transaction.type}-${transaction.id}-${index}`}
                  >

                    <td>
                      {transaction.date}
                    </td>

                    <td>
                      {transaction.type}
                    </td>

                    <td>
                      {transaction.title}
                    </td>

                    <td>
                      {transaction.category ||
                        "—"}
                    </td>

                    <td>
                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}

                      {formatCurrency(
                        transaction.amount
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </section>


      {/* =========================
          FOOTER ACTION
      ========================= */}

      <section>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </section>

    </div>
  );
}

export default Reports;