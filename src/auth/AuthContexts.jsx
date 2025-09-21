import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance.js';
import { apiHost } from '../App.jsx';
import { loadDB, restartIDB } from '../db.jsx';
import { useOnlineStatus } from '../app/components/Hooks.jsx';
import { API_ROUTES } from '../lib/routes.js';
import { showToast } from '@/app/components/toaster.jsx';

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

    // Login function
    const login = (mode) => {
        // store in local storage
        localStorage.setItem('authed', mode);
        localStorage.setItem('new-login', 'true');
        setAuth(mode);
    };

    // Logout function
    const logout = () => {
        // remove from local storage
        localStorage.removeItem('userdata');
        localStorage.removeItem('authed');
        localStorage.removeItem('new-login');
        
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
                    await axiosInstance.post( API_ROUTES.VERIFY_AUTH );
                    localStorage.removeItem('new-login');
                    
                } catch (err) {
                    // If token is invalid, logout
                    if (err.response?.status === 401) {
                        refreshToken();
                    } else {
                        console.error("Error verifying token:", err);
                    }
                }
            }
        }

        const refreshToken = async _ => {

            try {
                const response = await axiosInstance.post( API_ROUTES.REFRESH_AUTH );

                // Extract the new access token from the response
                // const newAccessToken = response.data.access;

                login('refresh');

            } catch (error) {
                if (error.response?.status === 401) {
                    if (localStorage.getItem('new-login') === 'true') {
                        showToast("This app makes use of third-party cookies for secure authentication. \n Please enable third-party cookies in your browser settings to ensure proper functionality.", { type: 'info', duration: 10000 });
                    }
                    
                    logout();                    
                } else {
                    console.error("Error refreshing token:", error.response?.data || error.message);
                }
            }

            localStorage.removeItem('new-login');
        };

        isOnline && verifyToken();

  }, [auth, isOnline]);

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};