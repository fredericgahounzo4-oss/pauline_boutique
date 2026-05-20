import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { CartProvider } from './context/CartContext';
import emailjs from '@emailjs/browser';

// ✅ INITIALISATION EMAILJS (IMPORTANT)
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)