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
        <div
            className="
                flex flex-col w-64 h-screen px-4 py-8
                bg-white dark:bg-gray-900
                border-r border-gray-200 dark:border-gray-700
                transition-colors duration-300
            "
        >
            {/* Logo */}
            <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
                Tracker
            </h2>

            <div className="flex flex-col justify-between flex-1 mt-6">
                {/* NAV */}
                <nav>
                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center px-4 py-2 mt-4 rounded-md
                                    transform transition-all duration-200
                                    hover:translate-x-2
                                    ${
                                        active
                                            ? 'bg-blue-100 text-blue-700 dark:bg-gray-800 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                {item.icon}
                                <span className="mx-4 font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <button
                    onClick={logout}
                    className="
                        flex items-center px-4 py-2 mt-6 rounded-md
                        transform transition-all duration-200
                        hover:translate-x-2
                        text-gray-600 dark:text-gray-300
                        hover:bg-gray-200 dark:hover:bg-gray-800
                    "
                >
                    <LogOut size={20} />
                    <span className="mx-4 font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
