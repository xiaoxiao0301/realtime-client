import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const styleEl = document.createElement("style");
styleEl.innerHTML = `
@media (max-width: 600px) {
  div[style*="max-width: calc(100% - 400px)"] {
    max-width: 100% !important;
    margin: 20px !important;
  }
}`;
document.head.appendChild(styleEl);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
