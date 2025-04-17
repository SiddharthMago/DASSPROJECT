"use client";
import React from "react";
import { Link } from "react-router-dom";

const OfficeSection = ({ title, cards, darkMode }) => {
  // Function to truncate long titles
  const formatTitle = (title) => {
    // Replace newlines with dashes
    const processedTitle = title.includes("\n") 
      ? title.split("\n").join(" - ") 
      : title;
    
    // The CSS will handle the truncation with text-overflow: ellipsis
    return processedTitle;
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
          >
            <div className="file-item">
              <div className="file-title" title={formatTitle(card.title)}>
                {formatTitle(card.title)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default OfficeSection;