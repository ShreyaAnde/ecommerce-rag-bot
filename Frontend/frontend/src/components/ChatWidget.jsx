import { useState, useCallback } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false); // New state to prevent multiple sends

  const sendMessage = useCallback(async () => {
    if (!input || isSending) return; // Prevent multiple sends

    setIsSending(true); // Disable sending

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/faq-chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      const botMsg = { role: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false); // Re-enable sending
      setInput("");
    }
  }, [input, isSending]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: "12px 16px",
          borderRadius: "50px",
          background: "#2563eb",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        💬 Ask AI
      </button>

      {/* Chat Box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 320,
            height: 400,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
            🤖 MyStore Assistant
          </div>

          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ margin: "8px 0" }}>
                <b>{m.role === "user" ? "You" : "Bot"}:</b> {m.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", padding: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: 8 }}
              placeholder="Ask something..."
              disabled={isSending} // Disable input while sending
            />
            <button onClick={sendMessage} disabled={isSending}>➤</button> {/* Disable button while sending */}
          </div>
        </div>
      )}
    </>
  );
}