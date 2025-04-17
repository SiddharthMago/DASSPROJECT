"use client";
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import OfficeSection from "./OfficeSection";
import FAQ from "./FAQ";
import "../../css/office.css";

const OfficePage = ({ darkMode }) => {
  const { officeName } = useParams(); // Get office name from URL
  const [files, setFiles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOffice, setUserOffice] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchOfficeContent = async () => {
      try {
        setLoading(true);
        
        // Fetch files for the specific office
        const filesResponse = await axios.get(`/api/files/office/${encodeURIComponent(officeName)}`, {
          params: { status: 'approved' }
        });
        
        // Fetch FAQs for the specific office
        const faqsResponse = await axios.get(`/api/faqs/office/${encodeURIComponent(officeName)}`);
        
        setFiles(filesResponse.data.data);
        setFaqs(faqsResponse.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching office content:', err);
        setError('Failed to load office content');
        setLoading(false);
      }
    };

    if (officeName) {
      fetchOfficeContent();
    }
  }, [officeName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Group files by category
  const filesByCategory = files.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {});

  return (
    <div className={`office-page ${darkMode ? 'dark-mode' : ''}`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
      />
      <h1 className="office-page-title">{officeName.toUpperCase()}</h1>

      {/* Dynamically render file sections by category */}
      {Object.entries(filesByCategory).map(([category, categoryFiles]) => (
        <OfficeSection
          key={category}
          title={category}
          cards={categoryFiles.map(file => ({
            title: file.name,
            url: file.url,
            filePath: file.filePath
          }))}
          darkMode={darkMode}
        />
      ))}

      <section className="faq-section">
        <h2 className="faq-title">FREQUENTLY ASKED QUESTIONS</h2>
        <FAQ 
          darkMode={darkMode} 
          faqs={faqs}
        />
      </section>
    </div>
  );
};

export default OfficePage;