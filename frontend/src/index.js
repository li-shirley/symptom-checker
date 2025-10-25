import React from 'react';
import { createRoot } from 'react-dom/client'; // <-- React 18 change
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Get the root container
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render your app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Performance measuring (optional)
reportWebVitals();
