import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import App from './App.jsx';
import { AuthContextProvider } from './providers/AuthContextProvider.jsx';
import SymptomCheckProvider from './providers/SymptomCheckProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
        <SymptomCheckProvider>
          <App />
        </SymptomCheckProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
)
