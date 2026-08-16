# 💰 SpendWise AI

> An AI-powered personal finance management application for tracking income, expenses, transactions, financial reports, and managing personal finances through an interactive dashboard.

SpendWise AI is a full-stack personal finance application built with **React**, **FastAPI**, **PostgreSQL**, and **AI-powered financial assistance**.

The goal of the project is to provide users with a centralized platform where they can manage their income and expenses, organize financial categories, monitor their financial activity, view reports, and interact with an AI assistant for financial insights.

---

## 📌 Project Overview

Managing personal finances often involves using multiple applications, spreadsheets, or manually tracking transactions.

**SpendWise AI** brings these functions together into one application.

Users can:

- Create and manage their account
- Securely log in and authenticate
- Record income and expenses
- Organize transactions using categories
- Monitor their financial activity
- View financial reports and analytics
- Manage their profile
- Change their password
- Reset a forgotten password
- Switch between light and dark themes
- Interact with an AI financial assistant

The application is designed with a separation between the **React frontend**, **FastAPI backend**, **database layer**, **authentication system**, and **service layer**.

---

# ✨ Features

## 👤 User Authentication

- User registration
- User login
- JWT-based authentication
- Protected API endpoints
- Secure password hashing using bcrypt
- Email validation
- Password change functionality
- Forgot password functionality
- Password reset using a temporary reset token
- Automatic token expiration
- Password reset token invalidation after successful reset

---

## 💰 Income Management

Users can:

- Add income
- View income records
- Organize income using categories
- Track income amounts
- Monitor income history
- Delete income records

---

## 💸 Expense Management

Users can:

- Add expenses
- View expense records
- Categorize expenses
- Track spending
- Delete expenses
- Monitor expense history

---

## 🔄 Transaction Management

SpendWise AI provides a unified view of financial activity.

Users can:

- View income and expense transactions
- Review transaction history
- Track financial activity
- Distinguish between income and expenses

---

## 📊 Financial Dashboard

The dashboard provides an overview of the user's financial situation.

It includes:

- Total income
- Total expenses
- Current balance
- Financial statistics
- Recent transactions
- Financial activity visualization
- Income and expense analysis

---

## 📈 Financial Reports

The reports section provides visual insights into financial activity.

Users can analyze:

- Income
- Expenses
- Spending patterns
- Financial trends
- Category-based spending
- Overall financial activity

---

## 🤖 AI Financial Assistant

SpendWise AI includes an AI-powered financial assistant designed to help users interact with their financial information.

The assistant can be used for:

- Financial questions
- Spending-related insights
- Personal finance assistance
- AI-generated responses
- Context-aware financial discussions

The backend contains a dedicated AI service and assistant service architecture.

---

## 👤 Profile Management

Users can:

- View their profile
- Update their name
- Update their email
- Upload a profile picture
- Manage their account information

---

## ⚙️ Account Settings

The settings section allows users to manage:

### Account

- Profile management

### Security

- Change password
- Current password verification
- New password confirmation

### Preferences

- Light mode
- Dark mode

### Session

- Logout

---

## 🌙 Light & Dark Mode

SpendWise AI supports both:

- ☀️ Light Mode
- 🌙 Dark Mode

Theme management is handled through a centralized React `ThemeContext`.

---

# 🛠️ Technology Stack

## Frontend

- React
- JavaScript
- Vite
- React Router
- CSS3
- Lucide React
- Chart-based financial visualizations

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- Alembic

## Database

- PostgreSQL
- Psycopg2

## Authentication & Security

- JWT
- OAuth2 Password Flow
- Passlib
- bcrypt
- Python-JOSE
- Email validation

## Artificial Intelligence

- AI-powered financial assistant
- Groq API integration
- Dedicated AI service layer

## Development Tools

- Visual Studio Code
- Git
- GitHub
- GitHub Actions
- PowerShell

---

# 🏗️ System Architecture

The application follows a layered full-stack architecture.

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │   Routers   │  │  Services   │  │    Auth     │
       │             │  │             │  │             │
       └─────────────┘  └──────┬──────┘  └─────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SQLAlchemy    │
                       │       ORM       │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │    Database     │
                       └─────────────────┘

                                │
                                ▼
                       ┌─────────────────┐
                       │   AI Service    │
                       │   Groq API      │
                       └─────────────────┘
```

---

# 🔄 Authentication Workflow

```text
User
 │
 ▼
Register
 │
 ▼
Validate Email
 │
 ▼
Hash Password
 │
 ▼
Store User in PostgreSQL
 │
 ▼
Login
 │
 ▼
Verify Password
 │
 ▼
Generate JWT
 │
 ▼
Access Protected Resources
```

---

# 🔐 Password Reset Workflow

```text
User
 │
 ▼
Forgot Password
 │
 ▼
Enter Email
 │
 ▼
Find User
 │
 ▼
Generate Secure Reset Token
 │
 ▼
Store Token + Expiration
 │
 ▼
Reset Password
 │
 ▼
Validate Token
 │
 ▼
Hash New Password
 │
 ▼
Invalidate Reset Token
```

> **Current development status:** the password reset flow currently returns the reset token directly for development/testing. In a production deployment this should be replaced with an email-based reset link.

---

# 📂 Project Structure

```text
SpendWise-Ai/
│
├── backend/
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   └── ...
│   │
│   ├── app/
│   │   │
│   │   ├── auth/
│   │   │   ├── dependencies.py
│   │   │   ├── hashing.py
│   │   │   ├── jwt_handler.py
│   │   │   └── oauth2.py
│   │   │
│   │   ├── database/
│   │   │   └── database.py
│   │   │
│   │   ├── enums/
│   │   │   └── category_type.py
│   │   │
│   │   ├── models/
│   │   │   ├── assistant_message.py
│   │   │   ├── category.py
│   │   │   ├── expense.py
│   │   │   ├── income.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── assistant.py
│   │   │   ├── auth.py
│   │   │   ├── categories.py
│   │   │   ├── dashboard.py
│   │   │   ├── expenses.py
│   │   │   ├── income.py
│   │   │   └── users.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── assistant.py
│   │   │   ├── auth.py
│   │   │   ├── category.py
│   │   │   ├── dashboard.py
│   │   │   ├── expense.py
│   │   │   ├── income.py
│   │   │   ├── token.py
│   │   │   ├── transaction.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── assistant_services.py
│   │   │   ├── category_services.py
│   │   │   ├── dashboard_services.py
│   │   │   ├── expense_services.py
│   │   │   ├── income_services.py
│   │   │   └── user_services.py
│   │   │
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   └── Avatar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Transactions.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── README.md
└── ...
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/Rqqureshi/SpendWise-Ai.git
```

Move into the project:

```bash
cd SpendWise-Ai
```

---

# ⚙️ Backend Setup

Move into the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

---

## 🗄️ Database Configuration

SpendWise AI uses PostgreSQL.

Create a PostgreSQL database and configure the backend environment variables.

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/spendwise
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

> Never commit your `.env` file or API keys to GitHub.

---

# 🧱 Database Migrations

SpendWise AI uses **Alembic** for database migrations.

From the `backend` directory:

```powershell
alembic upgrade head
```

To create a new migration after changing the SQLAlchemy models:

```powershell
alembic revision --autogenerate -m "describe your change"
```

Then apply it:

```powershell
alembic upgrade head
```

---

# ▶️ Run the Backend

From:

```text
SpendWise-Ai/backend
```

run:

```powershell
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

Open another terminal.

Move into the frontend:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```powershell
npm run dev
```

Vite will provide the local frontend URL in the terminal.

---

# 🔗 Backend API

The backend provides REST API endpoints for:

- Authentication
- Users
- Categories
- Income
- Expenses
- Dashboard
- AI Assistant

FastAPI automatically provides interactive API documentation through:

```text
http://127.0.0.1:8000/docs
```

---

# 🧪 Continuous Integration

The project includes a GitHub Actions workflow.

The CI pipeline currently performs:

- Backend dependency installation
- Python compilation checks
- FastAPI startup smoke test
- Root API endpoint verification

Workflow:

```text
.github/workflows/ci.yml
```

The workflow runs on:

- Pushes to `main`
- Pull requests targeting `main`

---

# 🔒 Security

Security-related functionality currently includes:

- Password hashing with bcrypt
- JWT authentication
- Protected API endpoints
- OAuth2 password authentication
- Environment variables for secrets
- Password reset token expiration
- Password reset token invalidation
- Email validation
- Uploaded user files excluded from Git

Sensitive files such as `.env` and user-uploaded files are excluded through `.gitignore`.

---

# 📸 Screenshots

Screenshots will be added as the UI is finalized.

### 🔐 Login

<!-- Add screenshot here -->

### 📝 Registration

<!-- Add screenshot here -->

### 📊 Dashboard

<!-- Add screenshot here -->

### 💰 Income Management

<!-- Add screenshot here -->

### 💸 Expense Management

<!-- Add screenshot here -->

### 🔄 Transactions

<!-- Add screenshot here -->

### 📈 Financial Reports

<!-- Add screenshot here -->

### 🤖 AI Assistant

<!-- Add screenshot here -->

### 👤 Profile

<!-- Add screenshot here -->

### ⚙️ Settings

<!-- Add screenshot here -->

---

# 🎯 Future Improvements

Planned improvements include:

- Production email-based password reset
- Improved financial analytics
- Better Ui
- More advanced AI financial insights
- Improved report generation
- PDF financial reports (Improved)
- CSV data export (More Options)
- Improved responsive design
- More granular CSS architecture
- Production deployment
- Improved API testing
- Automated frontend testing
- Improved security and validation
- Additional financial visualization features

---

# 📚 Learning Objectives

I am an Artificial Intelligence Student but also also Full Stack Development

This project is also being developed as a practical learning project covering:

- Full-stack web development
- REST API development
- React application architecture
- FastAPI backend development
- PostgreSQL database design
- SQLAlchemy ORM
- Database migrations with Alembic
- JWT authentication
- Password security
- API integration
- AI API integration
- Git and GitHub
- CI/CD fundamentals
- Frontend UI/UX development

---

# 👨‍💻 Author

## Rafay Ahmed Qureshi

Bachelor of Artificial Intelligence Engineering  
Near East University

### GitHub

https://github.com/Rqqureshi

### LinkedIn

https://www.linkedin.com/in/rafay-ahmed-qureshi-12a2b724a

---

# 📄 License

This project is currently intended for educational, development, and portfolio purposes.

---

⭐ If you find this project interesting, feel free to explore the repository.