"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminOfficeSection from "./AdminOfficeSection";
import FAQ from "./AdminFAQ";
import "../../css/office.css";

const AdminOfficePage = ({ darkMode }) => {
  const { officeName } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOffice, setUserOffice] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    // Fetch user's office and role from the token
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth_cas/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { office, role } = response.data;
        console.log('User profile:', response.data);
        setUserOffice(office);
        setUserRole(role);

        // Can edit if it's their own office or they are a superadmin
        setCanEdit(office === officeName || role === 'superadmin');

        // Fetch office content
        fetchOfficeContent(token);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Unable to verify user access');
        setLoading(false);
      }
    };

    const fetchOfficeContent = async (token) => {
      try {
        setLoading(true);
        
        // Fetch files for the specific office
        const filesResponse = await axios.get(`/api/offices/files/${encodeURIComponent(officeName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Process the files to filter out older versions
        const allFiles = filesResponse.data.data;
        
        // Collect all the version IDs
        const versionIds = new Set();
        
        allFiles.forEach(file => {
          if (file.versions && file.versions.length > 0) {
            file.versions.forEach(version => {
              if (version._id) {
                versionIds.add(version._id.toString());
              }
            });
          }
        });
        
        // Filter files to only include those that are not in any version arrays
        const latestFiles = allFiles.filter(file => !versionIds.has(file._id.toString())).filter(file => file.status === "approved");
        
        console.log("Admin view - All files:", allFiles.length);
        console.log("Admin view - Latest files (not in version arrays):", latestFiles.length);
        
        // Fetch FAQs for the specific office
        const faqsResponse = await axios.get(`/api/offices/faqs/${encodeURIComponent(officeName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Group files by category
        const groupedFiles = latestFiles.reduce((acc, file) => {
          if (!acc[file.category]) {
            acc[file.category] = [];
          }
          acc[file.category].push(file);
          return acc;
        }, {});

        setFiles(groupedFiles);
        setFaqs(faqsResponse.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching office content:', err);
        
        // More detailed error handling
        if (err.response && err.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load office content');
        }
        
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [officeName]);

  if (loading) return <div>Loading...</div>;

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      {error.includes('Session expired') && (
        <button onClick={() => navigate('/auth')}>
          Log In Again
        </button>
      )}
    </div>
  );

  return (
    <div className={`office-page ${darkMode ? 'dark-mode' : ''}`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
      />
      <h1 className="office-page-title">{officeName.toUpperCase()}</h1>

      {/* Dynamically render file sections by category */}
      {Object.entries(files).map(([category, categoryFiles]) => (
        <AdminOfficeSection
          key={category}
          title={category}
          category={officeName} // Pass the office name
          cards={categoryFiles.map(file => ({
            id: file._id,
            title: file.name,
            url: file.url,
            filePath: file.filePath,
            status: file.status,
            versions: file.versions || [],
            createdAt: file.createdAt
          }))}
          darkMode={darkMode}
          canEdit={canEdit}
        />
      ))}

      <section className="faq-section">
        <h2 className="faq-title">FREQUENTLY ASKED QUESTIONS</h2>
        <FAQ 
          isAdmin={true} 
          darkMode={darkMode} 
          faqs={faqs}
          officeName={officeName}
          canEdit={canEdit}
        />
      </section>
    </div>
  );
};

export default AdminOfficePage;