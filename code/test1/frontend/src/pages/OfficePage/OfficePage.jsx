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

  useEffect(() => {
    const fetchOfficeContent = async () => {
      try {
        setLoading(true);
        
        // Fetch files for the specific office
        const filesResponse = await axios.get(`/api/files/office/${encodeURIComponent(officeName)}`, {
          params: {
            status: 'approved'
          }
        });

        // Process the files to filter out older versions
        const allFiles = filesResponse.data.data;
        // Create a map to track the latest version of each file (by name or other identifier)
        const latestVersionMap = new Map();
        
        // For each file, check if it's in another file's versions array
        const fileIds = new Set(allFiles.map(file => file._id.toString()));
        const versionIds = new Set();
        
        // Collect all the version IDs
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
        const latestFiles = allFiles
                                    .filter(file => !versionIds.has(file._id.toString()))
                                    .filter(file => file.status === "approved");
        
        console.log("All files:", allFiles.length);
        console.log("Latest files (not in version arrays):", latestFiles.length);
        
        // Fetch FAQs for the specific office
        const faqsResponse = await axios.get(`/api/faqs/office/${encodeURIComponent(officeName)}`);
        
        setFiles(latestFiles);
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
    // Create a card object with all necessary properties including versions
    acc[file.category].push({
      title: file.name,
      url: file.url,
      filePath: file.filePath,
      versions: file.versions || [], // Include versions array as is
      createdAt: file.createdAt, // Include creation date for current version
      _id: file._id // Include ID for potential API calls
    });
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
          cards={categoryFiles}
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