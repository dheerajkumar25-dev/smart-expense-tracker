import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Plus, Trash2, Pencil } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState(null);
    const [monthlySpent, setMonthlySpent] = useState(0);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Food',
        date: ''
    });

    const [loading, setLoading] = useState(true);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const budgetUsedPercent =
        budget ? (monthlySpent / budget) * 100 : 0;

    const handleEdit = (expense) => {
        setEditingId(expense._id);
        setFormData({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: moment(expense.date).format('YYYY-MM-DD')
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingId) {
            if (budget && budgetUsedPercent >= 100) {
                toast.error('🚫 Budget exceeded! Cannot add expense.');
                return;
            }

            if (budget && budgetUsedPercent >= 80) {
                toast('⚠️ You are close to your budget limit!', { icon: '⚠️' });
            }
        }

        try {
            let response;

            if (editingId) {
                response = await axios.put(
                    `/expenses/${editingId}`,
                    { ...formData, amount: Number(formData.amount) }
                );

                setExpenses(
                    expenses.map(e =>
                        e._id === editingId ? response.data : e
                    )
                );

                toast.success('Expense updated');
            } else {
                response = await axios.post('/expenses', {
                    ...formData,
                    amount: Number(formData.amount),
                });

                setExpenses([response.data, ...expenses]);
                toast.success('Expense added');
            }

            setFormData({
                description: '',
                amount: '',
                category: 'Food',
                date: ''
            });
            setEditingId(null);
        } catch {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            await axios.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(e => e._id !== id));
            toast.success('Expense deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800">Expenses</h1>

            {/* Budget Status */}
            {budget && (
                <div className="mt-4 p-4 rounded-md bg-gray-100">
                    <p className="text-sm">
                        Budget Used: <b>{budgetUsedPercent.toFixed(1)}%</b>
                    </p>
                    {budgetUsedPercent >= 100 && (
                        <p className="text-red-600 font-semibold">
                            🚫 Budget exceeded
                        </p>
                    )}
                    {budgetUsedPercent >= 80 && budgetUsedPercent < 100 && (
                        <p className="text-yellow-600 font-semibold">
                            ⚠️ Close to budget limit
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Add / Edit Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? 'Edit Expense' : 'Add New Expense'}
                    </h2>

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
                            <option>Food</option>
                            <option>Transport</option>
                            <option>Utilities</option>
                            <option>Entertainment</option>
                            <option>Health</option>
                            <option>Other</option>
                        </select>

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full mb-4 px-4 py-2 border rounded-md"
                        />

                        <button
                            type="submit"
                            className={`w-full py-2 rounded-md ${
                                !editingId && budgetUsedPercent >= 100
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white'
                            }`}
                            disabled={!editingId && budgetUsedPercent >= 100}
                        >
                            {editingId ? 'Update Expense' : 'Add Expense'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        description: '',
                                        amount: '',
                                        category: 'Food',
                                        date: ''
                                    });
                                }}
                                className="w-full mt-2 py-2 bg-gray-200 rounded-md"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                {/* Expense List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">
                        Recent Transactions
                    </h2>

                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3">Description</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense._id} className="border-b">
                                    <td className="p-3">{expense.description}</td>
                                    <td className="p-3 font-semibold">
                                        ₹{expense.amount}
                                    </td>
                                    <td className="p-3">{expense.category}</td>
                                    <td className="p-3">
                                        {moment(expense.date).format('MMM Do YY')}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-4">
                                            {/* ✏️ EDIT ICON */}
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* 🗑 DELETE ICON */}
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {expenses.length === 0 && (
                        <p className="text-center mt-4 text-gray-500">
                            No expenses found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
