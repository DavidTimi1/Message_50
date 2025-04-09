import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance.js';
import { apiHost } from '../App.jsx';
import { loadDB, restartIDB } from '../db.jsx';
import { useOnlineStatus } from '../app/components/Hooks.jsx';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize from localStorage if available
        const token = localStorage.getItem('jwt');
        return token ? { token } : null;
    });
    const isOnline = useOnlineStatus();

    const verifyUrl = apiHost + '/token/verify';

    // Login function
    const login = (token) => {
        localStorage.setItem('jwt', token); // Store token in localStorage
        setAuth({ token });
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('userdata');
        localStorage.removeItem('jwt'); // Remove token
        setAuth(null);

        // clear user session data
        loadDB()
        .then(restartIDB);
    };

    
    // Verify token on load
    useEffect(() => {
        const verifyToken = async () => {
            if (auth?.token) {
                try {
                    // Verify token using the axios instance
                    await axiosInstance.post(verifyUrl, { token: auth.token });
                    
                } catch (err) {
                    // If token is invalid, logout
                    if (err.response?.status === 401) {
                        logout();
                    } else {
                        console.error("Error verifying token:", err);
                    }
                }
            }
        }

        isOnline && verifyToken();

  }, [auth, isOnline]);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
