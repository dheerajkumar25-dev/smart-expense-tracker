import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Budget from './pages/Budget';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';

function App() {
    // 🌙 Dark Mode State (GLOBAL)
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark'
    );

    // Apply/remove dark class on <html>
    useEffect(() => {
        const root = window.document.documentElement;

        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <Router>
            <AuthProvider>
                {/* 🌗 GLOBAL WRAPPER (NO BUTTON HERE) */}
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/"
                                element={
                                    <Dashboard
                                        darkMode={darkMode}
                                        setDarkMode={setDarkMode}
                                    />
                                }
                            />
                            <Route
                                path="/expenses"
                                element={
                                    <Expenses
                                        darkMode={darkMode}
                                        setDarkMode={setDarkMode}
                                    />
                                }
                            />
                            <Route
                                path="/budget"
                                element={
                                    <Budget
                                        darkMode={darkMode}
                                        setDarkMode={setDarkMode}
                                    />
                                }
                            />
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
