"use client";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const OfficeSection = ({ title, cards, darkMode }) => {
  // State to track which file is being hovered
  const [hoveredFileIndex, setHoveredFileIndex] = useState(null);

  // Function to truncate long titles
  const formatTitle = (title) => {
    // Replace newlines with dashes
    const processedTitle = title.includes("\n") 
      ? title.split("\n").join(" - ") 
      : title;
    
    // The CSS will handle the truncation with text-overflow: ellipsis
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
    
    // For local files (PDFs, etc.) or non-external URLs, go to file page
    // Important: Include the /user prefix in the path
    return `/user/file/${card._id}`;
  }

  // Function to determine where to navigate for a version
  const getVersionLink = (version, cardId) => {
    // External URLs (starting with http or www) should open directly
    if (version.url && isWebUrl(version.url)) {
      return version.url;
    }
    
    // If it has a filePath but it's not a web URL, go to file page with version ID
    return `/user/file/${cardId}?version=${version._id || version.id || ''}`;
  };

  // Function to determine if the link should open in a new tab
  const shouldOpenNewTab = (card) => {
    return card.url && isWebUrl(card.url);
  }

  // Function to determine if a version link should open in a new tab
  const shouldVersionOpenNewTab = (version) => {
    return version.url && isWebUrl(version.url);
  }

  return (
    <section className="admission-section">
      <h2 className="offices-section-title">{title}</h2>
      <div className="file-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="file-item-wrapper"
            onMouseEnter={() => setHoveredFileIndex(index)}
            onMouseLeave={() => setHoveredFileIndex(null)}
          >
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
              <div className="version-dialogue">
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
                          href={getVersionLink(version, card._id)}
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
                          to={getVersionLink(version, card._id)}
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

export default OfficeSection;