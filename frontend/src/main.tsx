import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { configureAmplify } from './services/amplify';
import './index.css';

// Must run before React renders so the first getCurrentUser() call sees the pool.
configureAmplify();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
