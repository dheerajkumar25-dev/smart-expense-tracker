import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Moon, Sun } from 'lucide-react';

/* ================= CURRENCY ================= */
const currencyRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
};

const currencySymbol = {
    INR: '₹',
    USD: '$',
    EUR: '€',
};

const Budget = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    const [budget, setBudget] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [currency, setCurrency] = useState(storedUser?.currency || 'INR');

    const [isDark, setIsDark] = useState(
        document.documentElement.classList.contains('dark')
    );

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchBudget();
        fetchTotalExpenses();
    }, []);

    const fetchBudget = async () => {
        try {
            const { data } = await axios.get('/budget');
            if (data) setSavedBudget(data.amount);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTotalExpenses = async () => {
        try {
            const { data } = await axios.get('/expenses/total/month');
            setTotalExpenses(data.total);
        } catch (error) {
            console.error(error);
        }
    };

    /* ================= DARK MODE ================= */
    const toggleDarkMode = () => {
        const root = document.documentElement;
        root.classList.toggle('dark');
        const active = root.classList.contains('dark');
        setIsDark(active);
        localStorage.setItem('theme', active ? 'dark' : 'light');
    };

    /* ================= CURRENCY ================= */
    const handleCurrencyChange = async newCurrency => {
        try {
            await axios.put('/auth/currency', { currency: newCurrency });

            const updatedUser = {
                ...storedUser,
                currency: newCurrency,
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrency(newCurrency);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= SAVE ================= */
    const handleSave = async () => {
        if (!budget) return;

        try {
            const { data } = await axios.post('/budget', {
                amount: Number(budget),
            });
            setSavedBudget(data.amount);
            setBudget('');
        } catch (error) {
            console.error(error);
        }
    };

    const remaining =
        savedBudget !== null ? savedBudget - totalExpenses : 0;

    const convert = value =>
        (value * currencyRates[currency]).toFixed(2);

    /* ================= UI ================= */
    return (
        <div className="space-y-6 text-gray-900 dark:text-gray-100 transition-colors">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Budget</h1>

                <div className="flex items-center gap-3">
                    <select
                        value={currency}
                        onChange={e => handleCurrencyChange(e.target.value)}
                        className="border px-3 py-2 rounded-md text-sm
                                   bg-white dark:bg-gray-800
                                   text-gray-800 dark:text-gray-200
                                   border-gray-300 dark:border-gray-700"
                    >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                    </select>

                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-md
                                   bg-gray-200 dark:bg-gray-700
                                   text-gray-800 dark:text-gray-200
                                   hover:scale-105 transition"
                        title="Toggle theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            {/* CARD (HOVER LIFT ADDED HERE) */}
            <div
                className="
                    bg-white dark:bg-gray-800
                    p-6 rounded-xl max-w-md
                    shadow-md
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                "
            >
                <label className="block font-medium mb-2">
                    Monthly Budget ({currencySymbol[currency]})
                </label>

                <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md
                               bg-white dark:bg-gray-700
                               border-gray-300 dark:border-gray-600"
                    placeholder="Enter amount"
                />

                <button
                    onClick={handleSave}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700
                               text-white py-2 rounded-md transition"
                >
                    Save Budget
                </button>

                {savedBudget !== null && (
                    <div className="mt-6 space-y-2">
                        <p className="font-semibold">
                            💰 Budget:{' '}
                            {currencySymbol[currency]}
                            {convert(savedBudget)}
                        </p>

                        <p className="font-semibold">
                            📉 Spent this month:{' '}
                            {currencySymbol[currency]}
                            {convert(totalExpenses)}
                        </p>

                        {remaining >= 0 ? (
                            <p className="text-green-600 font-semibold">
                                ✅ Remaining:{' '}
                                {currencySymbol[currency]}
                                {convert(remaining)}
                            </p>
                        ) : (
                            <p className="text-red-600 font-semibold">
                                ⚠️ Over budget by{' '}
                                {currencySymbol[currency]}
                                {convert(Math.abs(remaining))}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Budget;
