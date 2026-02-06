import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Plus, Trash2 } from 'lucide-react';
import moment from 'moment';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Food',
        date: ''
    });

    const [customCategory, setCustomCategory] = useState('');
    const [loading, setLoading] = useState(true);

    // Budget
    const [budget, setBudget] = useState(null);
    const [monthlyTotal, setMonthlyTotal] = useState(0);

    // Filters
    const [monthFilter, setMonthFilter] = useState('current');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchExpenses();
        fetchBudget();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [expenses, monthFilter, categoryFilter]);

    const fetchExpenses = async () => {
        try {
            const { data } = await axios.get('/expenses');
            setExpenses(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchBudget = async () => {
        try {
            const { data } = await axios.get('/budget');
            if (data) setBudget(data.amount);
        } catch (error) {
            console.error(error);
        }
    };

    const applyFilters = () => {
        let result = [...expenses];
        const now = moment();

        if (monthFilter === 'current') {
            result = result.filter(e =>
                moment(e.date).month() === now.month() &&
                moment(e.date).year() === now.year()
            );
        }

        if (monthFilter === 'previous') {
            const prev = now.clone().subtract(1, 'month');
            result = result.filter(e =>
                moment(e.date).month() === prev.month() &&
                moment(e.date).year() === prev.year()
            );
        }

        if (categoryFilter !== 'All') {
            result = result.filter(e => e.category === categoryFilter);
        }

        setFilteredExpenses(result);

        const total = result.reduce((sum, e) => sum + e.amount, 0);
        setMonthlyTotal(total);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (budget && monthlyTotal >= budget) {
            alert('🚨 Budget exceeded! Cannot add more expenses.');
            return;
        }

        const finalCategory =
            formData.category === 'Custom'
                ? customCategory
                : formData.category;

        try {
            const { data } = await axios.post('/expenses', {
                ...formData,
                category: finalCategory
            });

            setExpenses([data, ...expenses]);
            setFormData({
                description: '',
                amount: '',
                category: 'Food',
                date: ''
            });
            setCustomCategory('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(e => e._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const budgetUsage = budget ? (monthlyTotal / budget) * 100 : 0;

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800">Expenses</h1>

            {/* Budget Warning */}
            {budget && (
                <div className={`mt-4 p-3 rounded-md font-medium
                    ${budgetUsage >= 100
                        ? 'bg-red-100 text-red-700'
                        : budgetUsage >= 80
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'}`}>
                    {budgetUsage >= 100
                        ? '🚨 Budget exceeded! Expense adding blocked.'
                        : budgetUsage >= 80
                        ? '⚠️ You have used more than 80% of your budget.'
                        : '✅ Budget under control'}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 mt-6">
                <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="current">This Month</option>
                    <option value="previous">Previous Month</option>
                    <option value="all">All</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="All">All Categories</option>
                    {[...new Set(expenses.map(e => e.category))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Add Expense */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-bold mb-4">Add New Expense</h2>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full mb-3 px-4 py-2 border rounded-md"
                            required
                        />

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount (₹)"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full mb-3 px-4 py-2 border rounded-md"
                            required
                        />

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full mb-3 px-4 py-2 border rounded-md"
                        >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Health">Health</option>
                            <option value="Custom">Custom</option>
                        </select>

                        {formData.category === 'Custom' && (
                            <input
                                type="text"
                                placeholder="Enter custom category"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className="w-full mb-3 px-4 py-2 border rounded-md"
                                required
                            />
                        )}

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full mb-3 px-4 py-2 border rounded-md"
                        />

                        <button
                            type="submit"
                            disabled={budgetUsage >= 100}
                            className={`w-full py-2 rounded-md flex justify-center items-center
                                ${budgetUsage >= 100
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            <Plus size={18} className="mr-2" />
                            Add Expense
                        </button>
                    </form>
                </div>

                {/* Expense List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Transactions</h2>

                    {filteredExpenses.map((expense) => (
                        <div
                            key={expense._id}
                            className="flex justify-between items-center border p-4 rounded-md mb-3"
                        >
                            <div>
                                <p className="font-semibold">{expense.description}</p>
                                <p className="text-sm text-gray-500">
                                    {expense.category} • {moment(expense.date).format('DD MMM YYYY')}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="font-bold">₹{expense.amount}</p>
                                <button
                                    onClick={() => handleDelete(expense._id)}
                                    className="text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredExpenses.length === 0 && (
                        <p className="text-center text-gray-500">No expenses found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
