import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error("Critical Error: No element with id 'root' found in index.html.");
} else {
    // Show root only if we are inside the iframe
    const isWidget = window.self !== window.top;
    if (isWidget) {
        rootElement.style.display = "block";
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}