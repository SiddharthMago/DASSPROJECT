import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import User from "./pages/user.jsx";
import Admin from "./pages/admin.jsx";
import SuperAdmin from "./pages/superadmin.jsx";
import RoleProtectedRoute from "./pages/role_protected_route.jsx";
import AuthHandler from "./pages/authHandler.jsx";

function App() {
	// Initialize dark mode state
	const [darkMode, setDarkMode] = useState(() => {
		// Check localStorage or default to false
		const savedMode = localStorage.getItem('darkMode');
		return savedMode === 'true';
	});

	// Effect to update body class and localStorage
	useEffect(() => {
		if (darkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
		localStorage.setItem('darkMode', darkMode.toString());
	}, [darkMode]);

	return (
		<Router>
			<Routes>
				<Route path="/auth" element={<AuthHandler />} />
				<Route
					path="/user/*" 
					element={
						<RoleProtectedRoute allowedRole="user" allowGuest={true}>
							<User darkMode={darkMode} setDarkMode={setDarkMode} />
						</RoleProtectedRoute>
					} 
				/>
				<Route
					path="/admin/*" 
					element={
						<RoleProtectedRoute allowedRole="admin">
							<Admin darkMode={darkMode} setDarkMode={setDarkMode} />
						</RoleProtectedRoute>
					} 
				/>
				<Route 
					path="/superadmin/*" 
					element={
						<RoleProtectedRoute allowedRole="superadmin">
							<SuperAdmin darkMode={darkMode} setDarkMode={setDarkMode} />
						</RoleProtectedRoute>
					} 
				/>
				<Route 
					path="/" 
					element={
						<Navigate to="/user/home" />
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;