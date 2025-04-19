"use client";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';

const AdminOfficeSection = ({ title, category, cards, darkMode, canEdit = false }) => {
  // State to track which file is being hovered
  const [hoveredFileIndex, setHoveredFileIndex] = useState(null);
  // State to store user role
  const [userRole, setUserRole] = useState(null);
  
  // Use location to determine if we're in admin or superadmin route
  const location = useLocation();
  
  // Determine base path from current URL or fetch from user profile
  useEffect(() => {
    // Extract base path from current location
    const basePath = location.pathname.startsWith('/admin') 
      ? '/admin' 
      : location.pathname.startsWith('/superadmin') 
        ? '/superadmin' 
        : null;
        
    if (basePath) {
      setUserRole(basePath === '/admin' ? 'admin' : 'superadmin');
    } else {
      // Fallback to fetching user role if path doesn't clearly indicate role
      const fetchUserRole = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/auth_cas/user-profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      };
      
      fetchUserRole();
    }
  }, [location]);

  // Generate the correct "add file" path based on role
  const getAddFilePath = () => {
    if (userRole === 'admin') {
      return `/admin/add-file?office=${encodeURIComponent(category)}&category=${encodeURIComponent(title)}`;
    } else if (userRole === 'superadmin') {
      return `/superadmin/add-file?office=${encodeURIComponent(category)}&category=${encodeURIComponent(title)}`;
    }
    // Fallback to admin path if role is unknown
    return `/admin/add-file?office=${encodeURIComponent(category)}&category=${encodeURIComponent(title)}`;
  };

  // Function to truncate long titles
  const formatTitle = (title) => {
    const processedTitle = title.includes("\n") 
      ? title.split("\n").join(" - ") 
      : title;
    
    return processedTitle;
  };

  // Function to check if a URL is a web URL
  const isWebUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http') || url.startsWith('www');
  }

  // Function to determine the appropriate icon based on file type and versions
  const getFileIcon = (card) => {
    // Check if file has multiple versions
    const hasVersions = card.versions && card.versions.length > 0;
    
    // Check if it's a web URL
    if (card.url && isWebUrl(card.url)) {
      return hasVersions ? "🔗📚" : "🔗"; // Web URL with or without versions
    } else {
      return hasVersions ? "📁📚" : "📁"; // File with or without versions (including non-web URLs)
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Function to determine where to navigate when a card is clicked
  const getCardLink = (card) => {
    // External URLs (starting with http or www) should open directly
    if (card.url && isWebUrl(card.url)) {
      return card.url;
    }
    
    // Generate the correct path based on user role
    const basePath = userRole === 'superadmin' ? '/superadmin' : '/admin';
    return `${basePath}/file/${card.id}`;
  };

  // Function to determine where to navigate for a version
  const getVersionLink = (version, cardId) => {
    // External URLs (starting with http or www) should open directly
    if (version.url && isWebUrl(version.url)) {
      return version.url;
    }
    
    // If it has a filePath but it's not a web URL, go to file page with version ID
    const basePath = userRole === 'superadmin' ? '/superadmin' : '/admin';
    return `${basePath}/file/${cardId}?version=${version._id || version.id || ''}`;
  };

  // Function to determine if the link should open in a new tab
  const shouldOpenNewTab = (card) => {
    return card.url && isWebUrl(card.url);
  };
  
  // Function to determine if a version link should open in a new tab
  const shouldVersionOpenNewTab = (version) => {
    return version.url && isWebUrl(version.url);
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
      <div className="section-header">
        <h2 className="offices-section-title">{title}</h2>
        {canEdit && (
          <Link 
            to={getAddFilePath()} 
            className="add-file-button"
          >
            + Add New File
          </Link>
        )}
      </div>
      <div className="file-grid">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className="file-item-wrapper"
            onMouseEnter={() => setHoveredFileIndex(index)}
            onMouseLeave={() => setHoveredFileIndex(null)}
          >
            {canEdit && (
              <div 
                className="delete-btn" 
                onClick={(e) => handleDelete(e, card)}
                aria-label={`Delete ${card.title}`}
              >
                ×
              </div>
            )}
            {shouldOpenNewTab(card) ? (
              // External URLs open in new tab
              <a 
                href={card.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="file-link"
              >
                <div className="file-item">
                  <div className="file-title" title={formatTitle(card.title)}>
                    {getFileIcon(card)} {formatTitle(card.title)}
                  </div>
                </div>
              </a>
            ) : (
              // Local files and internal resources use Link to file page
              <Link 
                to={getCardLink(card)} 
                className="file-link"
              >
                <div className="file-item">
                  <div className="file-title" title={formatTitle(card.title)}>
                    {getFileIcon(card)} {formatTitle(card.title)}
                  </div>
                </div>
              </Link>
            )}
            
            {/* Version hover dialogue box */}
            {hoveredFileIndex === index && 
             card.versions && 
             card.versions.length > 0 && (
              <div 
                className="version-dialogue"
              >
                <h3>Versions</h3>
                <ul className="version-list">
                  {/* Current version */}
                  <li className="version-item current-version">
                    <span className="version-name">Current: {card.title}</span>
                    <span className="version-date">{formatDate(card.createdAt)}</span>
                  </li>
                  
                  {/* Previous versions */}
                  {card.versions.map((version, vIndex) => (
                    <li key={vIndex} className="version-item">
                      {shouldVersionOpenNewTab(version) ? (
                        // External version links open in new tab
                        <a 
                          href={getVersionLink(version, card.id)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="version-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="version-name">{version.name}</span>
                          <span className="version-date">{formatDate(version.createdAt)}</span>
                        </a>
                      ) : (
                        // Internal version links use React Router Link
                        <Link
                          to={getVersionLink(version, card.id)}
                          className="version-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="version-name">{version.name}</span>
                          <span className="version-date">{formatDate(version.createdAt)}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
        
        .version-dialogue {
          position: absolute;
          z-index: 10;
          background-color: ${darkMode ? '#2c2c2c' : '#ffffff'};
          border: 1px solid ${darkMode ? '#444' : '#ddd'};
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 10px;
          width: 250px;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 5px;
        }
        
        .version-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .version-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid ${darkMode ? '#444' : '#eee'};
        }
        
        .version-item:last-child {
          border-bottom: none;
        }
        
        .current-version {
          font-weight: bold;
          color: ${darkMode ? '#64b5f6' : '#0066cc'};
        }
        
        .version-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .version-date {
          font-size: 0.8em;
          color: ${darkMode ? '#aaa' : '#666'};
        }
        
        .version-link {
          display: flex;
          justify-content: space-between;
          width: 100%;
          text-decoration: none;
          color: inherit;
        }
        
        .version-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default AdminOfficeSection;