import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(
        localStorage.getItem('currency') || 'INR'
    );

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const format = (amount) => {
        return `${symbols[currency]}${Number(amount).toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider
            value={{ currency, setCurrency, format }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
