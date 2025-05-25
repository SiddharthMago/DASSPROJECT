import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import NavBar_User from './nav_bar_user.jsx';
import Footer from './footer.jsx';

import HomeUser from './home_user.jsx';
import OfficePage from './OfficePage/OfficePage.jsx';
import Archive from './Archive.jsx';
import ContactsUser from "./contacts_user.jsx";
import FilePageUser from './file_page_user.jsx';

function User({ darkMode, setDarkMode }) {
    // If darkMode is passed as a prop, use it; otherwise, initialize local state
    const [localDarkMode, setLocalDarkMode] = useState(darkMode !== undefined ? darkMode : false);
    
    // Use the props if provided, otherwise use local state
    const actualDarkMode = darkMode !== undefined ? darkMode : localDarkMode;
    const actualSetDarkMode = setDarkMode !== undefined ? setDarkMode : setLocalDarkMode;
    
    // Effect to synchronize body class with dark mode state
    useEffect(() => {
        if (actualDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [actualDarkMode]);

    console.log("[userRouter] current path: ", window.location.pathname);

    return (
        <div className={`app-container ${actualDarkMode ? 'dark-mode' : ''}`}>
            <link
                href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            <NavBar_User darkMode={actualDarkMode} setDarkMode={actualSetDarkMode} />
            <Routes>
                <Route path='/' element={<Navigate to="home" />} />
                <Route path="home" element={<HomeUser darkMode={actualDarkMode} />} />
                
                {/* Keep this route for dynamic office pages */}
                <Route path="offices/:officeName" element={<OfficePage darkMode={actualDarkMode} />} />
                <Route path='file/:id' element={<FilePageUser darkMode={actualDarkMode} />} />
                <Route path="archive" element={<Archive darkMode={actualDarkMode} />} />
                <Route path='search' element={<Archive darkMode={actualDarkMode} />} />
            </Routes>
            <Footer darkMode={actualDarkMode} />
        </div>
    );
}

export default User;