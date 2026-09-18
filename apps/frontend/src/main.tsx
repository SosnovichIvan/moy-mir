import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@app/app';
import { BrowserRouter } from 'react-router';
import '@app/styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Application root element is missing');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
