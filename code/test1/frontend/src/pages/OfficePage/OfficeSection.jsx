"use client";
import React, { useState } from "react";

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

  return (
    <section className="admission-section">
      <h2 className="offices-section-title">{title}</h2>
      <div className="file-grid">
        {cards.map((card, index) => (
          <a 
            key={index}
            href={card.url || card.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
            onMouseEnter={() => setHoveredFileIndex(index)}
            onMouseLeave={() => setHoveredFileIndex(null)}
          >
            <div className="file-item">
              <div className="file-title">
                {getFileIcon(card)} {formatTitle(card.title)}
              </div>
            </div>
            
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
                      <a 
                        href={version.url || version.filePath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="version-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="version-name">{version.name}</span>
                        <span className="version-date">{formatDate(version.createdAt)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export default OfficeSection;