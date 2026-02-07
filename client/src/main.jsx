import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CurrencyProvider } from './context/CurrencyContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <CurrencyProvider>
            <App />
            <Toaster position="top-right" />
        </CurrencyProvider>
    </React.StrictMode>
);
