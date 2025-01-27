import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance.js';
import { apiHost } from '../App.jsx';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize from localStorage if available
        const token = localStorage.getItem('jwt');
        return token ? { token } : null;
    });

    const verifyUrl = apiHost + '/token/verify';

    // Login function
    const login = (token) => {
        localStorage.setItem('jwt', token); // Store token in localStorage
        setAuth({ token });
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('jwt'); // Remove token
        setAuth(null);
    };

    
    // Verify token on load
    useEffect(() => {
        const verifyToken = async () => {
            if (auth?.token) {
                try {
                    // Verify token using the axios instance
                    await axiosInstance.post(verifyUrl, { token: auth.token });
                    
                } catch (err) {
                    logout(); // Logout if token is invalid
                }
            }
        }

        verifyToken();

  }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
