import React, { useState } from "react";

const ChatBox = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    fetch("http://127.0.0.1:8000/api/ask/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAnswer(data.answer);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="chatbox">
      <h3>🤖 Ask a Question</h3>

      <input
        type="text"
        placeholder="Type your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="input"
      />

      <button onClick={askQuestion} className="btn">
        Ask
      </button>

      {loading && <p>Thinking...</p>}

      {answer && (
        <div className="answer">
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;