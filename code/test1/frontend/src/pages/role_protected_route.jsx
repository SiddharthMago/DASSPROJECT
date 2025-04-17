import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import jwt_decode from 'jwt-decode';

function RoleProtectedRoute({ children, allowedRole, allowGuest = false }) {
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (!token){
        if (allowedRole === "user" && allowGuest) {
            return children;
        }
        return <Navigate to="/" replace />;
    }

    try {
        const { role } = JSON.parse(atob(token.split('.')[1]));

        if (role === allowedRole) {
            return children;
        }
        else {
            return <Navigate to={`/${role}/home`} replace />
        }
    }
    catch (err) {
        return <Navigate to="/user/home" replace />;
    }
}

export default RoleProtectedRoute;