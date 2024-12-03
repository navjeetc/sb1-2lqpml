import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initOfflineSync } from './utils/offlineStorage';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

// Initialize offline sync functionality
initOfflineSync();

// Register service worker
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);