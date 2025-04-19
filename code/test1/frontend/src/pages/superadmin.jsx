import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import NavBar_SuperAdmin from './nav_bar_superadmin.jsx';
import Footer from './footer.jsx';

import HomeAdmin from './home_superadmin.jsx';
import FilePageAdmin from './file_page_admin.jsx';
import AdminOfficePage from './AdminOfficePage/AdminOfficePage.jsx';
import PendingApprovals from './Pending_Approval.jsx';
import Archive from './Archive.jsx';
import FileUpload from './FileUpload.jsx';
import ContactsAdmin from "./contacts_admin.jsx";

function SuperAdmin({ darkMode, setDarkMode }) {
    // If darkMode is passed as a prop, use it; otherwise, initialize local state
    const [localDarkMode, setLocalDarkMode] = useState(darkMode !== undefined ? darkMode : true);
    
    // Use the props if provided, otherwise use local state
    const actualDarkMode = darkMode !== undefined ? darkMode : localDarkMode;
    const actualSetDarkMode = setDarkMode !== undefined ? setDarkMode : setLocalDarkMode;

    return (
        <div className={`app-container ${actualDarkMode ? 'dark-mode' : ''}`}>
            <link
                href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            <NavBar_SuperAdmin darkMode={actualDarkMode} setDarkMode={actualSetDarkMode} />
            <Routes>
            <Route path='/' element={<Navigate to="home" />} />
                <Route path="home" element={<HomeAdmin darkMode={actualDarkMode} />} />
                <Route path="file" element={<FilePageAdmin darkMode={actualDarkMode} />} />
                <Route path='office' element={<AdminOfficePage darkMode={actualDarkMode} />} />
                <Route path='pending_approval' element={<PendingApprovals darkMode={actualDarkMode} />} />
                <Route path='archive' element={<Archive darkMode={actualDarkMode} userRole="superadmin" />} />
                <Route path='search' element={<Archive darkMode={actualDarkMode} />} />
                <Route path='add-file' element={<FileUpload darkMode={actualDarkMode} />} />
                <Route path='contacts' element={<ContactsAdmin darkMode={actualDarkMode} />} />
                <Route path='office' element={<AdminOfficePage darkMode={actualDarkMode} /> } />
                <Route path="/offices/:officeName" element={<AdminOfficePage darkMode={actualDarkMode} />} />
                <Route path="/file/:id" element={<FilePageAdmin darkMode={actualDarkMode} />} />
            </Routes>
            <Footer darkMode={actualDarkMode} />
        </div>
    );
}

export default SuperAdmin;