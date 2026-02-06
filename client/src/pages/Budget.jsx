import { useEffect, useState } from 'react';
import axios from '../utils/axios';

const Budget = () => {
    const [budget, setBudget] = useState('');
    const [savedBudget, setSavedBudget] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);

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

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800">Budget</h1>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-md max-w-md">
                <label className="block font-medium text-gray-700 mb-2">
                    Monthly Budget (₹)
                </label>

                <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md"
                    placeholder="Enter amount"
                />

                <button
                    onClick={handleSave}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                    Save Budget
                </button>

                {savedBudget !== null && (
                    <div className="mt-4 space-y-2">
                        <p className="font-semibold">
                            💰 Budget: ₹{savedBudget}
                        </p>
                        <p className="font-semibold">
                            📉 Spent this month: ₹{totalExpenses}
                        </p>

                        {remaining >= 0 ? (
                            <p className="text-green-600 font-semibold">
                                ✅ Remaining: ₹{remaining}
                            </p>
                        ) : (
                            <p className="text-red-600 font-semibold">
                                ⚠️ Over budget by ₹{Math.abs(remaining)}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Budget;
