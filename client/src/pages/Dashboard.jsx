import { useContext, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AuthContext from '../context/AuthContext';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ darkMode, setDarkMode }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState(null);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // 🌍 Currency
    const [currency, setCurrency] = useState(
        localStorage.getItem('currency') || 'INR'
    );

    const currencySymbol = currency === 'USD' ? '$' : '₹';

    const handleCurrencyChange = (e) => {
        const value = e.target.value;
        setCurrency(value);
        localStorage.setItem('currency', value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const expenseRes = await axios.get('/expenses');
                const budgetRes = await axios.get('/budget');

                setExpenses(expenseRes.data);
                if (budgetRes.data) setBudget(budgetRes.data.amount);

                const total = expenseRes.data.reduce(
                    (acc, e) => acc + e.amount,
                    0
                );
                setMonthlyTotal(total);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    const remaining = budget !== null ? budget - monthlyTotal : null;

    const usagePercent =
        budget && budget > 0
            ? ((monthlyTotal / budget) * 100).toFixed(1)
            : 0;

    const categories = [...new Set(expenses.map(e => e.category))];
    const categoryData = categories.map(cat =>
        expenses
            .filter(e => e.category === cat)
            .reduce((acc, e) => acc + e.amount, 0)
    );

    const pieData = {
        labels: categories,
        datasets: [
            {
                data: categoryData,
                backgroundColor: [
                    '#60a5fa',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#a78bfa',
                    '#fb7185',
                ],
            },
        ],
    };

    const lastExpense = expenses[0];

    // ✅ HOVER CARD CLASS (ONLY ADDITION)
    const cardClass = `
        bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
    `;

    return (
        <div className="space-y-10 text-gray-900 dark:text-gray-100 transition-colors">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Welcome back, {user?.name} 👋
                    </p>
                </div>

                {/* RIGHT CONTROL BAR */}
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800
                                border border-gray-200 dark:border-gray-700
                                px-4 py-2 rounded-lg shadow-sm">

                    <select
                        value={currency}
                        onChange={handleCurrencyChange}
                        className="bg-transparent text-sm
                                   border border-gray-300 dark:border-gray-600
                                   rounded px-2 py-1"
                    >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                    </select>

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        title="Toggle theme"
                        className="text-xl hover:scale-110 transition"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            {/* TOP SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cardClass}>
                    <p className="text-sm text-gray-500">Monthly Budget</p>
                    <p className="mt-2 text-3xl font-extrabold">
                        {currencySymbol}{budget ?? '—'}
                    </p>
                </div>

                <div className={cardClass}>
                    <p className="text-sm text-gray-500">Spent This Month</p>
                    <p className="mt-2 text-3xl font-extrabold">
                        {currencySymbol}{monthlyTotal}
                    </p>
                </div>

                <div className={cardClass}>
                    <p className="text-sm text-gray-500">
                        {remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}
                    </p>
                    <p
                        className={`mt-2 text-3xl font-extrabold ${
                            remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {currencySymbol}
                        {remaining !== null ? Math.abs(remaining) : '—'}
                    </p>
                </div>
            </div>

            {/* TRANSACTION + RECENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cardClass}>
                    <p className="text-sm text-gray-500">Transaction Count</p>
                    <p className="mt-2 text-4xl font-bold">
                        {expenses.length}
                    </p>
                </div>

                <div className={cardClass}>
                    <p className="text-sm text-gray-500">Recent Activity</p>
                    {lastExpense ? (
                        <p className="mt-2 font-semibold">
                            {lastExpense.description}{' '}
                            <span className="text-gray-500">
                                ({currencySymbol}{lastExpense.amount})
                            </span>
                        </p>
                    ) : (
                        <p className="mt-2 text-gray-400">
                            No transactions yet
                        </p>
                    )}
                </div>
            </div>

            {/* BUDGET USED */}
            <div className={cardClass}>
                <div className="flex justify-between mb-2">
                    <p className="font-semibold">Budget Used</p>
                    <p className="font-semibold">{usagePercent}%</p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full ${
                            usagePercent < 80
                                ? 'bg-green-500'
                                : usagePercent < 100
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* CHART + ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={cardClass}>
                    <h2 className="text-lg font-semibold mb-4">
                        Expenses by Category
                    </h2>
                    {expenses.length > 0 ? (
                        <Pie data={pieData} />
                    ) : (
                        <p className="text-gray-400">No data available</p>
                    )}
                </div>

                <div className={cardClass}>
                    <h2 className="text-lg font-semibold mb-4">
                        Quick Actions
                    </h2>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/expenses')}
                            className="py-2 rounded-md bg-blue-100 dark:bg-blue-900
                                       text-blue-700 dark:text-blue-300"
                        >
                            View Full History
                        </button>

                        <button
                            onClick={() => navigate('/budget')}
                            className="py-2 rounded-md bg-green-100 dark:bg-green-900
                                       text-green-700 dark:text-green-300"
                        >
                            Set Monthly Budget
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
