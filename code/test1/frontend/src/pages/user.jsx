import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';

import NavBar_User from './nav_bar_user.jsx';
import Footer from './footer.jsx';

import HomeUser from './home_user.jsx';
import OfficePage from './OfficePage/OfficePage.jsx';
import Archive from './Archive.jsx';
import ContactsUser from "./contacts_user.jsx";
import FilePageUser from './file_page_user.jsx';

const allowedOffices = [
    "Admissions Office",
    "Library Office",
    "Examinations Office",
    "Academic Office",
    "Student Affairs Office",
    "Mess Office",
    "Hostel Office",
    "Alumni Cell",
    "Faculty Portal",
    "Placement Cell",
    "Outreach Office",
    "Statistical Cell",
    "R&D Office",
    "General Administration",
    "Accounts Office",
    "IT Services Office",
    "Communication Office",
    "Engineering Office",
    "HR & Personnel"
];

function OfficeRouteWrapper(props) {
    const { officeName } = useParams();
    const decodedOffice = decodeURIComponent(officeName || "");
    if (!allowedOffices.includes(decodedOffice)) {
        return <Navigate to="/user/home#offices" replace />;
    }
    return <OfficePage {...props} />;
}

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
                <Route path="offices/:officeName" element={<OfficeRouteWrapper darkMode={actualDarkMode} />} />
                <Route path='file/:id' element={<FilePageUser darkMode={actualDarkMode} />} />
                <Route path="archive" element={<Archive darkMode={actualDarkMode} />} />
                <Route path="*" element={<Navigate to="/user/home" replace />} />
            </Routes>
            <Footer darkMode={actualDarkMode} />
        </div>
    );
}

export default User;