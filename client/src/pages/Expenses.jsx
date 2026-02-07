import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Trash2, Pencil, Moon, Sun } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ================= CURRENCY CONFIG ================= */
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

const PRESET_CATEGORIES = [
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Health',
];

const Expenses = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState(null);
    const [monthlySpent, setMonthlySpent] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [currency, setCurrency] = useState(storedUser?.currency || 'INR');
    const [loading, setLoading] = useState(true);

    const [isDark, setIsDark] = useState(
        document.documentElement.classList.contains('dark')
    );

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Food',
        customCategory: '',
        date: '',
    });

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        fetchExpenses();
        fetchBudget();
    }, []);

    useEffect(() => {
        const total = expenses
            .filter(e => moment(e.date).isSame(moment(), 'month'))
            .reduce((sum, e) => sum + e.amount, 0);

        setMonthlySpent(total);
    }, [expenses]);

    const fetchExpenses = async () => {
        try {
            const { data } = await axios.get('/expenses');
            setExpenses(data);
        } catch {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchBudget = async () => {
        try {
            const { data } = await axios.get('/budget');
            if (data) setBudget(data.amount);
        } catch {
            console.error('Budget fetch failed');
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

    /* ================= FORM HANDLERS ================= */
    const handleChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = expense => {
        setEditingId(expense._id);

        const isPreset = PRESET_CATEGORIES.includes(expense.category);

        setFormData({
            description: expense.description,
            amount: expense.amount,
            category: isPreset ? expense.category : 'Custom',
            customCategory: isPreset ? '' : expense.category,
            date: moment(expense.date).format('YYYY-MM-DD'),
        });
    };

    const budgetUsedPercent =
        budget ? ((monthlySpent / budget) * 100).toFixed(1) : 0;

    const handleSubmit = async e => {
        e.preventDefault();

        if (!editingId && budget && budgetUsedPercent >= 100) {
            toast.error('🚫 Budget exceeded! Cannot add expense.');
            return;
        }

        const finalCategory =
            formData.category === 'Custom'
                ? formData.customCategory.trim()
                : formData.category;

        if (!finalCategory) {
            toast.error('Category cannot be empty');
            return;
        }

        try {
            let response;

            if (editingId) {
                response = await axios.put(`/expenses/${editingId}`, {
                    ...formData,
                    category: finalCategory,
                    amount: Number(formData.amount),
                });

                setExpenses(expenses.map(e =>
                    e._id === editingId ? response.data : e
                ));
                toast.success('Expense updated');
            } else {
                response = await axios.post('/expenses', {
                    ...formData,
                    category: finalCategory,
                    amount: Number(formData.amount),
                });

                setExpenses([response.data, ...expenses]);
                toast.success('Expense added');
            }

            setFormData({
                description: '',
                amount: '',
                category: 'Food',
                customCategory: '',
                date: '',
            });
            setEditingId(null);
        } catch {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            await axios.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(e => e._id !== id));
            toast.success('Expense deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    /* ================= CURRENCY ================= */
    const convertAmount = amount =>
        (amount * currencyRates[currency]).toFixed(2);

    const handleCurrencyChange = async newCurrency => {
        try {
            await axios.put('/auth/currency', { currency: newCurrency });

            const updatedUser = {
                ...storedUser,
                currency: newCurrency,
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrency(newCurrency);

            toast.success(`Currency changed to ${newCurrency}`);
        } catch {
            toast.error('Failed to update currency');
        }
    };

    /* ================= PDF EXPORT ================= */
    const exportPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Expense Report', 14, 15);
            doc.setFontSize(11);
            doc.text(`Currency: ${currency}`, 14, 23);

            autoTable(doc, {
                startY: 30,
                head: [['Description', 'Amount', 'Category', 'Date']],
                body: expenses.map(e => [
                    e.description,
                    `${currencySymbol[currency]}${convertAmount(e.amount)}`,
                    e.category,
                    moment(e.date).format('YYYY-MM-DD'),
                ]),
            });

            doc.save('expenses.pdf');
            toast.success('PDF downloaded successfully');
        } catch {
            toast.error('PDF export failed');
        }
    };

    if (loading) {
        return <p className="text-gray-600 dark:text-gray-300">Loading...</p>;
    }

    /* ================= UI ================= */
    return (
        <div className="space-y-6 text-gray-900 dark:text-gray-100 transition-colors">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Expenses</h1>

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
                        onClick={exportPDF}
                        className="bg-green-600 hover:bg-green-700
                                   text-white px-4 py-2 rounded-md transition"
                    >
                        Export PDF
                    </button>

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

            {/* ================= BUDGET STATUS ================= */}
            {budget && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Budget Used</span>
                        <span className="font-semibold">{budgetUsedPercent}%</span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full ${
                                budgetUsedPercent < 80
                                    ? 'bg-green-500'
                                    : budgetUsedPercent < 100
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ================= FORM + TABLE ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? 'Edit Expense' : 'Add Expense'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* unchanged form */}
                        <input
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            required
                        />
                        <input
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="Amount"
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            required
                        />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            {PRESET_CATEGORIES.map(c => (
                                <option key={c}>{c}</option>
                            ))}
                            <option value="Custom">Custom</option>
                        </select>

                        {formData.category === 'Custom' && (
                            <input
                                name="customCategory"
                                value={formData.customCategory}
                                onChange={handleChange}
                                placeholder="Enter custom category"
                                className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                required
                            />
                        )}

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />

                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition">
                            {editingId ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </form>
                </div>

                {/* TABLE */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(e => (
                                <tr
                                    key={e._id}
                                    className="border-b dark:border-gray-700
                                               transition-all duration-200
                                               hover:bg-gray-50 dark:hover:bg-gray-700
                                               hover:translate-x-2 hover:shadow-sm"
                                >
                                    <td className="p-3">{e.description}</td>
                                    <td className="p-3 font-semibold">
                                        {currencySymbol[currency]}
                                        {convertAmount(e.amount)}
                                    </td>
                                    <td className="p-3">{e.category}</td>
                                    <td className="p-3">
                                        {moment(e.date).format('MMM Do YY')}
                                    </td>
                                    <td className="p-3 flex gap-3">
                                        <button onClick={() => handleEdit(e)}>
                                            <Pencil size={16} className="text-blue-500" />
                                        </button>
                                        <button onClick={() => handleDelete(e._id)}>
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {expenses.length === 0 && (
                        <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
                            No expenses found
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
