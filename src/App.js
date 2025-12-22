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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle state
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
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: data.error || data.textResponse || "No answer found." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // We add 'sidebar-open' class to the container based on state
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      
      {/* This overlay closes the menu when you click outside it on mobile */}
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>

      <div className="sidebar">
        <h2 className="logo">DCR Assistant</h2>
        <div className="nav-list">
          {PDF_LIST.map(pdf => (
            <button 
              key={pdf.id}
              className={`nav-item ${activePdf.id === pdf.id ? 'active' : ''}`}
              onClick={() => { 
                setActivePdf(pdf); 
                setMessages([]); 
                setSidebarOpen(false); // Close menu after selecting on mobile
              }}
            >
              {pdf.name}
            </button>
          ))}
        </div>
      </div>

      <div className="main-chat">
        <div className="chat-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            ☰ Menu
          </button>
          <div>Chatting with: <strong>{activePdf.name}</strong></div>
        </div>

        <div className="message-list">
          {messages.length === 0 && (
            <div className="welcome">Ask about {activePdf.name} regulations.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="bubble thinking">Analyzing PDF...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAi()}
            placeholder="Type your query..."
          />
          <button className="send-btn" onClick={askAi} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;