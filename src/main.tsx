import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSync } from './utils/syncManager';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

// Initialize sync functionality
initializeSync();

// Register service worker
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);