import { Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, PieChart, LogOut } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/expenses', icon: <DollarSign size={20} />, label: 'Expenses' },
        { path: '/budget', icon: <PieChart size={20} />, label: 'Budget' },
    ];

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
            <h2 className="text-3xl font-bold text-center text-blue-600">Tracker</h2>
            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-2 mt-4 text-gray-600 rounded-md hover:bg-gray-200 ${isActive(item.path) ? 'bg-gray-200 text-blue-600' : ''
                                }`}
                        >
                            {item.icon}
                            <span className="mx-4 font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 mt-4 text-gray-600 rounded-md hover:bg-gray-200"
                >
                    <LogOut size={20} />
                    <span className="mx-4 font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
