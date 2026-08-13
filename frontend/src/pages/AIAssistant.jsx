import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AIAssistant() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm SpendWise AI. Ask me anything about your spending, income, savings, or financial decisions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();

    if (!message || loading) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/assistant/chat",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
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
          data.detail || "Unable to get a response from SpendWise AI."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.message ||
            "Something went wrong while contacting SpendWise AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Can I afford to spend $200?",
    "How can I spend less?",
    "What am I spending the most on?",
    "Should I save more money?",
  ];

  return (
    <div className="ai-page">
      <div className="ai-container">

        {/* HEADER */}
        <header className="ai-header">
          <button
            className="ai-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="ai-header-center">
            <div className="ai-header-icon">✦</div>

            <div>
              <h1>SpendWise AI</h1>
              <p>Your personal financial assistant</p>
            </div>
          </div>

          <div className="ai-header-status">
            <span></span>
            Ready
          </div>
        </header>

        {/* CHAT */}
        <main className="ai-chat-area">

          {messages.length === 1 && (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">✦</div>

              <h2>How can I help?</h2>

              <p>
                Ask me about your spending, income, savings,
                or whether you can afford a purchase.
              </p>

              <div className="ai-suggestions">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ai-messages">
            {messages.map((message, index) => (
              <div
                className={`ai-message-row ${
                  message.role === "user"
                    ? "user-message-row"
                    : "assistant-message-row"
                }`}
                key={index}
              >
                {message.role === "assistant" && (
                  <div className="ai-message-avatar">
                    ✦
                  </div>
                )}

                <div
                  className={`ai-message ${
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  <div className="ai-message-label">
                    {message.role === "user"
                      ? "You"
                      : "SpendWise AI"}
                  </div>

                  <div className="ai-message-content">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-row assistant-message-row">
                <div className="ai-message-avatar">
                  ✦
                </div>

                <div className="ai-message assistant-message">
                  <div className="ai-message-label">
                    SpendWise AI
                  </div>

                  <div className="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* INPUT */}
        <div className="ai-input-section">

          <form
            className="ai-input-form"
            onSubmit={handleSubmit}
          >
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask SpendWise AI a financial question..."
              rows={1}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="ai-send-button"
            >
              ↑
            </button>
          </form>

          <p className="ai-input-hint">
            Press Enter to send • Shift + Enter for a new line
          </p>

        </div>

      </div>
    </div>
  );
}

export default AIAssistant;