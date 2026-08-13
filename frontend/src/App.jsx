import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Transactions from "./pages/Transactions";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";

import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/income"
            element={<Income />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/ai"
            element={<AIAssistant />}
          />

          

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;