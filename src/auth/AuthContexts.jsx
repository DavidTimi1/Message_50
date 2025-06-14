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
        const authenticated = localStorage.getItem('authed');
        return authenticated ? authenticated : null;
    });
    const isOnline = useOnlineStatus();

    const verifyUrl = apiHost + '/token/verify';
    const refreshUrl = apiHost + '/token/refresh';

    // Login function
    const login = (mode) => {
        // store in local storage
        localStorage.setItem('authed', mode);
        setAuth(mode);
    };

    // Logout function
    const logout = () => {
        // remove from local storage
        localStorage.removeItem('userdata');
        localStorage.removeItem('authed');
        
        setAuth(null);

        // clear user session data
        loadDB()
        .then(restartIDB);
    };

    
    // Verify token on load
    useEffect(() => {
        const verifyToken = async () => {
            if (auth) {
                try {
                    // Verify token using the axios instance
                    await axiosInstance.post(verifyUrl);
                    
                } catch (err) {
                    // If token is invalid, logout
                    if (err.response?.status === 401) {
                        refreshToken()
                    } else {
                        console.error("Error verifying token:", err);
                    }
                }
            }
        }

        const refreshToken = async _ => {

            try {
                const response = await axiosInstance.post(refreshUrl)

                // Extract the new access token from the response
                const newAccessToken = response.data.access;

                login(newAccessToken, refreshToken); // Update the auth state with the new token

            } catch (error) {
                if (error.response?.status === 401) {
                    logout();
                } else {
                    console.error("Error refreshing token:", error.response?.data || error.message);
                }
            }
        };

        isOnline && verifyToken();

  }, [auth, isOnline]);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};