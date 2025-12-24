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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatWindowVisible, setChatWindowVisible] = useState(false); // Controls the widget popup
  const bottomRef = useRef(null);

  // Detect if the app is inside an iframe
  const isWidget = window.self !== window.top;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle clicking outside the widget to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById('chat-widget-container');
      if (container && !container.contains(event.target) && chatWindowVisible) {
        setChatWindowVisible(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [chatWindowVisible]);

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

  // --- RENDER 1: THE PORTAL VIEW (Host Site) ---
  if (!isWidget) {
    return (
      <div className="portal-container">
        <div className="hero">
          <h1>Development Control Regulations (DCR)</h1>
          <p>Welcome to the official portal for DNH, Gujarat, and Diu regulations.</p>
        </div>

        <div id="chat-widget-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <button 
            id="chat-launcher" 
            onClick={(e) => { e.stopPropagation(); setChatWindowVisible(!chatWindowVisible); }}
            style={{ 
                width: '60px', height: '60px', borderRadius: '50%', 
                backgroundColor: chatWindowVisible ? '#ef4444' : '#2563eb',
                color: 'white', border: 'none', cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {chatWindowVisible ? '✖' : '💬'}
          </button>

          {chatWindowVisible && (
            <div id="chat-window" style={{ 
                position: 'absolute', bottom: '80px', right: 0, 
                width: '380px', height: '600px', borderRadius: '16px', 
                overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', 
                border: '1px solid #e2e8f0', background: 'white' 
            }}>
              {/* Point back to itself, but it will detect it's an iframe next time */}
              <iframe src="/" title="chatbot-iframe" style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 2: THE CHATBOT VIEW (Inside Iframe) ---
  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''} widget-mode`}>
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
                setSidebarOpen(false); 
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
            <div className="welcome">Hello! 👋<br/>Ask about {activePdf.name} regulations.</div>
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