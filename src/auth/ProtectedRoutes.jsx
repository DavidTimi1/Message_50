import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { auth } = useAuth();
    const path = useLocation().pathname;

    // Redirect to login if not authenticated
    return auth?.token ? children : <Navigate to="/login" state={{next: path}} />;
};



export const useAuth = () => {
    return useContext(AuthContext);
};


export default ProtectedRoute;
