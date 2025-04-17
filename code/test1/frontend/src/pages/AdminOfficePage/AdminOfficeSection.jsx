"use client";
import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const AdminOfficeSection = ({ title, category, cards, darkMode, canEdit = false }) => {
  // Function to truncate long titles
  const formatTitle = (title) => {
    const processedTitle = title.includes("\n") 
      ? title.split("\n").join(" - ") 
      : title;
    
    return processedTitle;
  };

  // Generate unique URLs based on the section title and card title
  const generateUrl = (fileId) => {
    return `/admin/file/${fileId}`;
  };

  const handleDelete = async (e, card) => {
    if (!canEdit) return;

    e.preventDefault();
    e.stopPropagation();
    
    // Confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');

        // Make API call to delete the file
        const response = await axios.delete(`/api/files/${card.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Optional: Reload or update the page/list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting file:', error);
        
        // More detailed error handling
        if (error.response && error.response.status === 401) {
          alert('Session expired. Please log in again.');
        } else {
          alert(`Failed to delete file: ${error.message}`);
        }
      }
    }
  };

  return (
    <section className="admission-section">
      <h2 className="offices-section-title">{title}</h2>
      <div className="file-grid">
        {cards.map((card) => (
          <div key={card.id} className="file-item-wrapper">
            {canEdit && (
              <div 
                className="delete-btn" 
                onClick={(e) => handleDelete(e, card)}
                aria-label={`Delete ${card.title}`}
              >
                ×
              </div>
            )}
            <a 
              href={card.url || card.filePath} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="file-link"
            >
              <div className="file-item">
                <div className="file-title" title={formatTitle(card.title)}>
                  {formatTitle(card.title)}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Inline styles */}
      <style jsx>{`
        .file-item-wrapper {
          position: relative;
          margin-bottom: 15px;
        }
        
        .file-item-wrapper .delete-btn {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </section>
  );
};

export default AdminOfficeSection;