import React, { useState, useEffect } from "react";

const FAQ = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");

  // 🔥 Load session_id from localStorage
  useEffect(() => {
    const existingSession = localStorage.getItem("session_id");
    if (existingSession) {
      setSessionId(existingSession);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input; // store safely
    setInput(""); // clear input immediately

    // ✅ Add user message ONCE
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText }
    ]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/faq-chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      console.log("API Response:", data); // 🔍 debug

      // ✅ Save session_id if new
      if (data.session_id && !sessionId) {
        localStorage.setItem("session_id", data.session_id);
        setSessionId(data.session_id);
      }

      // ✅ Safe bot response
      const botText = data.answer || "No response from bot";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botText }
      ]);

    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error" }
      ]);
    }
  };

  // 🔥 Optional: New Chat Button
  const newChat = () => {
    localStorage.removeItem("session_id");
    setSessionId("");
    setMessages([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>FAQ Chat Assistant 🤖</h2>

      <button onClick={newChat} style={{ marginBottom: "10px" }}>
        New Chat
      </button>

      {/* Chat Box */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index + msg.text} // ✅ prevent duplicate rendering bug
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
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage(); // 🔥 Enter key support
        }}
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