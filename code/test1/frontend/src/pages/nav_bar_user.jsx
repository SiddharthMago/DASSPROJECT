import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css'; // We'll create this file for styling
import iiithLogo from '../assets/iiit-logo.png';

function NavBar_User({ darkMode, setDarkMode }){
    // State for mobile menu toggle
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    })
  
    // Use setDarkMode from props
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

	// Toggle mobile menu
	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

    const handleCASLogin = () => {
        const userRole = "user";
        const serviceURL = encodeURIComponent(`http://intranet.iiit.ac.in/${userRole}`);
        const serviceURL_test = encodeURIComponent("http://localhost:5000/api/auth_cas/cas-callback");
        window.location.href = `https://login.iiit.ac.in/cas/login?service=${serviceURL_test}`;
        setMobileMenuOpen(false);
    }

    const handleLogOut = () => {
        localStorage.removeItem("token");
        window.location.href = `https://login.iiit.ac.in/cas/logout?service=${encodeURIComponent("http://localhost:5173/")}`;
    };

    return(
        <nav className="navbar">
            <div className={`navbar-logo ${darkMode ? 'dark-mode' : ''}`}>
                <img
                    src={iiithLogo}
                    alt="IIIT-Hyderabad Logo"
                    className={`logo ${darkMode ? 'invert' : ''}`}
                />
            </div>

            {/* Hamburger menu for mobile */}
            <div className="hamburger-menu" onClick={toggleMobileMenu}>
                <div className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* Navigation links - will transform based on screen size */}
            <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <Link to="/user/home" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/user/archive?tab=All" onClick={() => setMobileMenuOpen(false)}>Search</Link>
                <Link to="/user/archive?tab=Announcements" onClick={() => setMobileMenuOpen(false)}>Announcements</Link>
                <Link to="/user/home#offices" onClick={() => setMobileMenuOpen(false)}>Offices</Link>
                <Link to="/user/archive?tab=Links" onClick={() => setMobileMenuOpen(false)}>Quick Links</Link>
                <Link to="/user/contacts" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
                {isLoggedIn ? (
                    <Link onClick={() => handleLogOut()}>Log Out</Link>
                ) : (
                    <Link onClick={() => handleCASLogin()}>Log In</Link>
                )}
            </div>

            <div className="navbar-mode-toggle">
                <button onClick={toggleDarkMode}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}

export default NavBar_User;