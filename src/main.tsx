import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Stale service worker cache recovery — when a JS chunk can't be loaded
// after a new deploy (old SW serves index.html instead), wipe all caches and reload once.
window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (msg.includes('not a valid JavaScript MIME type') || msg.includes('Failed to fetch dynamically imported module')) {
    const reload = () => window.location.reload();
    if (typeof caches !== 'undefined') {
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(reload)
        .catch(reload);
    } else {
      reload();
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
