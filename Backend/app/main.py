from expense import Expense
import csv
import calendar
import datetime


def main():
    print("Welcome to the Expense Tracker!")
    expense_file_path = "expenses.csv"
    budget = 800.0  # Set your budget here

    # Input the expense details
    expense = get_user_expense()

    # Write their expenses to the file
    save_expense_to_file(expense, expense_file_path)

    # Read file and summarize expenses by category
    summarize_expenses_by_category(expense_file_path, budget)

def get_user_expense():
    print(f"🎯 Getting user expense details...")
    expense_name = input("Enter expense name: ")
    expense_amount = float(input("Enter expense amount: "))

    expense_categories = [
        "🍔 Food", 
        "🏠 Home Rent", 
        "🎬 Entertainment", 
        "💡 Utilities", 
        "📦 Other"
    ]

    while True:
        print("Select a category:")
        for i, expense_category in enumerate(expense_categories, start=1):
            print(f"{i}. {expense_category}")

        value_range = f"[1-{len(expense_categories)}]"
        try:
            selected_index = int(input(f"Enter the category number {value_range}: ")) -1
        except ValueError:
            print("Invalid input. Please enter a number!")
            continue
        if selected_index in range(len(expense_categories)):
            new_expense = Expense(name=expense_name, category=expense_categories[selected_index], amount=expense_amount)
            return new_expense
        else:
            print("Invalid input. Please enter a number!")


def save_expense_to_file(expense: Expense, expense_file_path: str):
    print(f"🎯 Saving expense details to file: {expense} to {expense_file_path}...")
    with open(expense_file_path, "a", encoding="utf-8") as f:
        f.write(f"{expense.name},{expense.amount},{expense.category}\n")

def summarize_expenses_by_category(expense_file_path, budget: float = 0):
    print(f"🎯 Summarizing expenses by category from {expense_file_path}...")
    expenses: list[Expense] = []
    with open (expense_file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        for line in lines:
            expense_name, expense_amount, expense_category = line.strip().split(",")
            line_expense = Expense(
                name=expense_name, 
                amount=float(expense_amount), 
                category=expense_category,
            )
            # print(line_expense)
            expenses.append(line_expense)



    amount_by_category = {}
    for expense in expenses:
        key = expense.category
        if key in amount_by_category:
            amount_by_category[key] += expense.amount
        else:
            amount_by_category[key] = expense.amount

    print("Expense Summary by Category 📈:")
    for key, amount in amount_by_category.items():
        print(f" {key}: {amount: .2f}")

    total_spent = sum([expense.amount for ex in expenses])
    print(f"💵 Total Spent: {total_spent}")

    remianing_budget = budget - total_spent
    print(f"✅ Remaining Budget: {remianing_budget: .2f}")

    # Get the current month and year
    now = datetime.datetime.now()

    # Get the number of days in the current month
    days_in_month = calendar.monthrange(now.year, now.month)[1]

    # Calculate the remaining number of the days in the current month
    remaining_days = days_in_month - now.day
    print(f"📅 Remaining Days in the Month: {remaining_days}")

    daily_budget = remianing_budget / remaining_days if remaining_days > 0 else 0
    print(green(f"💰 Budget per day: {daily_budget: .2f}"))

def green(text):
    return f"\033[92m{text}\033[0m"

if __name__ == "__main__":
    main()