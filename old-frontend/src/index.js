import React from 'react';
import { createRoot } from 'react-dom/client'; // <-- React 18 change
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root container
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render your app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance measuring (optional)
reportWebVitals();
