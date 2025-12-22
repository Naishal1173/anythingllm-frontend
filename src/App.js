import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const PROXY_URL = "https://anythingllm-proxy.onrender.com/api/chat";
const PDF_LIST = [
  { id: 'pdf1', name: 'DNH DCR' },
  { id: 'pdf2', name: 'Gujarat DCR' },
  { id: 'pdf3', name: 'Diu DCR' }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePdf, setActivePdf] = useState(PDF_LIST[0]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askAi = async () => {
    if (!input.trim() || loading) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${PROXY_URL}/${activePdf.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, mode: "query" }),
      });

      const data = await response.json();

      if (data.error) {
        // This catches the 429 Rate Limit error from the Proxy
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: data.error 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: data.textResponse || "No answer found in this DCR." 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "Connection error: The service may be sleeping. Please try again in a few seconds." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 className="logo">DCR Assistant</h2>
        <div className="nav-list">
          {PDF_LIST.map(pdf => (
            <button 
              key={pdf.id}
              className={`nav-item ${activePdf.id === pdf.id ? 'active' : ''}`}
              onClick={() => { setActivePdf(pdf); setMessages([]); }}
            >
              {pdf.name}
            </button>
          ))}
        </div>
      </div>

      <div className="main-chat">
        <div className="chat-header">
          Chatting with: <strong>{activePdf.name}</strong>
        </div>

        <div className="message-list">
          {messages.length === 0 && (
            <div className="welcome">
              Ask a question about {activePdf.name} rules (e.g., FSI, parking, or fire safety).
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          
          {loading && (
            <div className="message bot">
              <div className="bubble thinking">Analyzing DCR documents...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAi()}
            placeholder={`Ask about ${activePdf.name}...`}
          />
          <button onClick={askAi} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;