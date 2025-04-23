"use client";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";

const OfficeSection = ({ title, cards, darkMode }) => {
  // State to track which file is being hovered
  const [hoveredFileIndex, setHoveredFileIndex] = useState(null);
  // Ref to store position of the hovered file
  const hoveredItemRef = useRef(null);
  // Ref for the dialogue box to detect hovers
  const dialogueRef = useRef(null);
  // Create a state for portal container
  const [portalContainer, setPortalContainer] = useState(null);
  // State to keep track of mouse being over the dialogue
  const [isOverDialogue, setIsOverDialogue] = useState(false);
  // Timer ref for delayed closing
  const closeTimerRef = useRef(null);

  // Effect to create a portal container when component mounts
  useEffect(() => {
    // Create portal container for version dialogues
    const container = document.createElement('div');
    container.classList.add('version-dialogue-container');
    document.body.appendChild(container);
    setPortalContainer(container);

    // Clean up on unmount
    return () => {
      document.body.removeChild(container);
    };
  }, []);

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
    const hasVersions = card.versions && card.versions.length > 0;
    if (card.url && isWebUrl(card.url)) {
      return hasVersions ? "🔗📚" : "🔗";
    } else {
      return hasVersions ? "📁📚" : "📁";
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
    if (card.url && isWebUrl(card.url)) {
      return card.url;
    }
    return `/user/file/${card._id}`;
  }

  // Function to get the preview URL for a version
  const getVersionPreviewUrl = (version) => {
    if (version.url && isWebUrl(version.url)) {
      return version.url;
    }
    if (version.fileId) {
      return `/user/file/${version.fileId}`;
    }
    if (version._id) {
      return `/user/file/${version._id}`;
    }
    return "#";
  };

  // Function to determine if the link should open in a new tab
  const shouldOpenNewTab = (card) => {
    return card.url && isWebUrl(card.url);
  }

  // Function to determine if a version link should open in a new tab
  const shouldVersionOpenNewTab = (version) => {
    return version.url && isWebUrl(version.url);
  }

  // Function to cancel any pending close timer
  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Handler for mouse enter on file item
  const handleMouseEnter = (index, e) => {
    // Cancel any pending close timer
    cancelCloseTimer();
    
    setHoveredFileIndex(index);
    // Save reference to the current target for positioning
    hoveredItemRef.current = e.currentTarget;
  };

  // Handler for mouse leave on file item
  const handleMouseLeave = () => {
    // Set a delay before closing the dialogue
    // This creates a tolerance window for moving to the dialogue
    closeTimerRef.current = setTimeout(() => {
      // Only close the dialogue if mouse is not over the dialogue
      if (!isOverDialogue) {
        setHoveredFileIndex(null);
        hoveredItemRef.current = null;
      }
    }, 300); // 300ms delay gives time to move to the dialogue
  };

  // Handler for mouse enter on dialogue
  const handleDialogueMouseEnter = () => {
    // Cancel any pending close timer
    cancelCloseTimer();
    setIsOverDialogue(true);
  };

  // Handler for mouse leave on dialogue
  const handleDialogueMouseLeave = () => {
    // Set a delay before closing the dialogue
    closeTimerRef.current = setTimeout(() => {
      setIsOverDialogue(false);
      setHoveredFileIndex(null);
      hoveredItemRef.current = null;
    }, 200); // Slightly shorter delay when leaving the dialogue
  };

  // Function to render version dialogue in a portal
  const renderVersionDialogue = () => {
    if (hoveredFileIndex === null || !hoveredItemRef.current || !portalContainer) return null;
    
    const card = cards[hoveredFileIndex];
    if (!card.versions || card.versions.length === 0) return null;

    // Get position of the hovered item
    const rect = hoveredItemRef.current.getBoundingClientRect();
    
    // Calculate position for the dialogue
    const dialogueStyle = {
      position: 'fixed',
      zIndex: 10000,
      backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
      border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      padding: '12px',
      width: '250px',
      maxHeight: '300px',
      overflowY: 'auto',
      left: `${rect.left}px`,
      top: `${rect.bottom + 5}px`, // 5px below the item
    };

    return ReactDOM.createPortal(
      <div 
        style={dialogueStyle} 
        className="version-dialogue-portal"
        ref={dialogueRef}
        onMouseEnter={handleDialogueMouseEnter}
        onMouseLeave={handleDialogueMouseLeave}
      >
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          color: darkMode ? '#ffffff' : '#333333'
        }}>Versions</h3>
        <ul style={{
          listStyle: 'none',
          padding: '0',
          margin: '0'
        }}>
          {/* Current version */}
          <li style={{
            padding: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${darkMode ? '#444' : '#eee'}`,
            fontWeight: 'bold',
            backgroundColor: darkMode ? '#003366' : '#e6f7ff',
            borderRadius: '4px',
            marginBottom: '4px'
          }}>
            <Link 
              to={getCardLink(card)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: '10px',
                maxWidth: '150px'
              }}>Current: {card.title}</span>
              <span style={{
                fontSize: '12px',
                opacity: '0.7',
                whiteSpace: 'nowrap',
                textAlign: 'right'
              }}>{formatDate(card.createdAt)}</span>
            </Link>
          </li>
          
          {/* Previous versions */}
          {card.versions.map((version, vIndex) => (
            <li key={vIndex} style={{
              padding: '6px 0',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: vIndex === card.versions.length - 1 ? 'none' : `1px solid ${darkMode ? '#444' : '#eee'}`
            }}>
              {shouldVersionOpenNewTab(version) ? (
                <a 
                  href={getVersionPreviewUrl(version)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    color: 'inherit',
                    textDecoration: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '10px',
                    maxWidth: '150px'
                  }}>{version.name}</span>
                  <span style={{
                    fontSize: '12px',
                    opacity: '0.7',
                    whiteSpace: 'nowrap',
                    textAlign: 'right'
                  }}>{formatDate(version.createdAt)}</span>
                </a>
              ) : (
                <Link
                  to={getVersionPreviewUrl(version)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    color: 'inherit',
                    textDecoration: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '10px',
                    maxWidth: '150px'
                  }}>{version.name}</span>
                  <span style={{
                    fontSize: '12px',
                    opacity: '0.7',
                    whiteSpace: 'nowrap',
                    textAlign: 'right'
                  }}>{formatDate(version.createdAt)}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>,
      portalContainer
    );
  };

  return (
    <section className="admission-section">
      <h2 className="offices-section-title">{title}</h2>
      <div className="file-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="file-item-wrapper"
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            {shouldOpenNewTab(card) ? (
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
          </div>
        ))}
      </div>
      
      {/* Render version dialogue through portal */}
      {renderVersionDialogue()}
    </section>
  );
};

export default OfficeSection;