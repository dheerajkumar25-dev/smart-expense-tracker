import { useContext, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AuthContext from '../context/AuthContext';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
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
        fetchExpenses();
    }, []);

    const totalExpense = expenses.reduce(
        (acc, curr) => acc + curr.amount,
        0
    );

    // ⭐ Category Chart Data
    const categories = [...new Set(expenses.map((e) => e.category))];

    const categoryData = categories.map((cat) =>
        expenses
            .filter((e) => e.category === cat)
            .reduce((acc, curr) => acc + curr.amount, 0)
    );

    const pieData = {
        labels: categories,
        datasets: [
            {
                label: 'Expenses by Category',
                data: categoryData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // ⭐ Chart Responsive Options
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800">
                Dashboard
            </h1>

            <p className="mt-4 text-gray-600">
                Welcome back, {user?.name}!
            </p>

            {/* ⭐ Stats Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold text-gray-700">
                        Total Expenses
                    </h2>
                    <p className="mt-2 text-3xl font-semibold">
                        ${totalExpense.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h2 className="text-xl font-bold text-gray-700">
                        Transaction Count
                    </h2>
                    <p className="mt-2 text-3xl font-semibold">
                        {expenses.length}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <h2 className="text-xl font-bold text-gray-700">
                        Recent Activity
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {expenses.length > 0
                            ? `Last: ${expenses[0].description} ($${expenses[0].amount})`
                            : 'No transactions'}
                    </p>
                </div>
            </div>

            {/* ⭐ Charts + Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ⭐ Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">
                        Expenses by Category
                    </h2>

                    <div className="relative w-full h-64">
                        {expenses.length > 0 ? (
                            <Pie
                                data={pieData}
                                options={pieOptions}
                            />
                        ) : (
                            <p className="flex items-center justify-center h-full">
                                No data to display
                            </p>
                        )}
                    </div>
                </div>

                {/* ⭐ Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">
                        Quick Actions
                    </h2>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/expenses')}
                            className="w-full py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                            View Full History
                        </button>

                        <button
                            onClick={() => navigate('/budget')}
                            className="w-full py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
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
