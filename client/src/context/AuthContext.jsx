import { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/register', userData);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const login = async (userData) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/login', userData);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
