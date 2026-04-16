import React, { useState } from "react";

const FAQ = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Call backend
    const res = await fetch("http://127.0.0.1:8000/api/faqs/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();

    // Add bot response
    const botMsg = { sender: "bot", text: data.answer };
    setMessages((prev) => [...prev, botMsg]);

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>FAQ Chat Assistant 🤖</h2>

      {/* Chat Box */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                background:
                  msg.sender === "user" ? "#007bff" : "#e5e5e5",
                color: msg.sender === "user" ? "white" : "black",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder="Ask your question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "70%", padding: "10px" }}
      />

      <button
        onClick={sendMessage}
        style={{ padding: "10px", marginLeft: "10px" }}
      >
        Send
      </button>
    </div>
  );
};

export default FAQ;