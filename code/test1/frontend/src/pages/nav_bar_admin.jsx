import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css';
import iiithLogo from '../assets/iiit-logo.png';
import helpPdf from '../assets/Intranet_Manual_Admin.pdf';

function NavBar_Admin({ darkMode, setDarkMode }) {
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
        const userRole = "admin";
        const serviceURL = encodeURIComponent(`http://intranet.iiit.ac.in/${userRole}`);
        const serviceURL_test = encodeURIComponent("http://localhost:5000/api/auth_cas/cas-callback");
        window.location.href = `https://login.iiit.ac.in/cas/login?service=${serviceURL_test}`;
        setMobileMenuOpen(false);
    }

    const handleLogOut = () => {
        localStorage.removeItem("token");
        window.location.href = `https://login.iiit.ac.in/cas/logout?service=${encodeURIComponent("http://localhost:5173/")}`;
    };

    const goToHelpPdf = () => window.open(helpPdf, '_blank');

    return (
        <nav className="navbar">
            <div className={`navbar-logo ${darkMode ? 'dark-mode' : ''}`}>
                <img
                    src={iiithLogo}
                    alt="IIIT-Hyderabad Logo"
                    className={`logo ${darkMode ? 'invert' : ''}`}
                    onClick={() => window.location.href = '/'}
                    cursor="pointer"
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
                <Link to="/admin/home" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/admin/archive?tab=All" onClick={() => setMobileMenuOpen(false)}>Search/Archive</Link>
                <Link to="/admin/archive?tab=Announcements" onClick={() => setMobileMenuOpen(false)}>Announcements</Link>
                <Link to="/admin/home#offices" onClick={() => setMobileMenuOpen(false)}>Offices</Link>
                <Link to="/admin/archive?tab=Links" onClick={() => setMobileMenuOpen(false)}>Quick Links</Link>
                {/* Admin-specific navigation links */}
                <Link to="/admin/add-file" onClick={() => setMobileMenuOpen(false)}>Add file</Link>
                <Link to="/admin/contacts" onClick={() => setMobileMenuOpen(false)}>Users</Link>
                {isLoggedIn ? (
                    <Link onClick={() => handleLogOut()}>Log Out</Link>
                ) : (
                    <Link onClick={() => handleCASLogin()}>Log In</Link>
                )}
            </div>
            
            <div className="navbar-mode-toggle">
                <button onClick={goToHelpPdf} className="navbar-help-button" title="Get Help">
                    ❓
                </button>
            
                <button onClick={toggleDarkMode} className="navbar-mode-toggle-button" style={{marginLeft: '20px'}}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}

export default NavBar_Admin;