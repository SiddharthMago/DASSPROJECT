import React, { useState } from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';

import NavBar_SuperAdmin from './nav_bar_superadmin.jsx';
import Footer from './footer.jsx';

import HomeAdmin from './home_superadmin.jsx';
import FilePageAdmin from './file_page_admin.jsx';
import AdminOfficePage from './AdminOfficePage/AdminOfficePage.jsx';
import PendingApprovals from './Pending_Approval.jsx';
import Archive from './Archive.jsx';
import FileUpload from './FileUpload.jsx';
import ContactsAdmin from "./contacts_admin.jsx";

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
        return <Navigate to="/superadmin/home#offices" replace />;
    }
    return <AdminOfficePage {...props} />;
}

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
                <Route path='pending_approval' element={<PendingApprovals darkMode={actualDarkMode} />} />
                <Route path='archive' element={<Archive darkMode={actualDarkMode} userRole="superadmin" />} />
                <Route path='add-file' element={<FileUpload darkMode={actualDarkMode} />} />
                <Route path='contacts' element={<ContactsAdmin darkMode={actualDarkMode} />} />
                <Route path="/offices/:officeName" element={<OfficeRouteWrapper darkMode={actualDarkMode} />} />
                <Route path="/file/:id" element={<FilePageAdmin darkMode={actualDarkMode} />} />
                <Route path="*" element={<Navigate to="/superadmin/home" replace />} />
            </Routes>
            <Footer darkMode={actualDarkMode} />
        </div>
    );
}

export default SuperAdmin;