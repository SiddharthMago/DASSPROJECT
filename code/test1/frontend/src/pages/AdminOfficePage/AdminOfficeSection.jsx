"use client";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';
import ReactDOM from "react-dom";

const AdminOfficeSection = ({ title, category, cards, darkMode, canEdit = false }) => {
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
  // State to store user role
  const [userRole, setUserRole] = useState(null);
  
  // Use location to determine if we're in admin or superadmin route
  const location = useLocation();
  
  // Effect to create a portal container when component mounts
  useEffect(() => {
    // Create portal container for version dialogues
    const container = document.createElement('div');
    container.classList.add('version-dialogue-container');
    document.body.appendChild(container);
    setPortalContainer(container);

    // Clean up on unmount
    return () => {
      // Remove the portal container
      document.body.removeChild(container);
      
      // Clear any pending timers
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);
  
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
    
    // If version has _id, use that
    const versionId = version._id || version.id || '';
    
    // Generate the correct path based on user role
    const basePath = userRole === 'superadmin' ? '/superadmin' : '/admin';
    return `${basePath}/file/${versionId}`;
  };

  // Function to determine if the link should open in a new tab
  const shouldOpenNewTab = (card) => {
    return card.url && isWebUrl(card.url);
  };
  
  // Function to determine if a version link should open in a new tab
  const shouldVersionOpenNewTab = (version) => {
    return version.url && isWebUrl(version.url);
  };

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

  // Function to render version dialogue in a portal
  const renderVersionDialogue = () => {
    if (hoveredFileIndex === null || !hoveredItemRef.current || !portalContainer) return null;
    
    const card = cards[hoveredFileIndex];
    if (!card.versions || card.versions.length === 0) return null;

    // Get position of the hovered item
    const rect = hoveredItemRef.current.getBoundingClientRect();
    
    // Calculate position for the dialogue - match user view exactly
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
      top: `${rect.bottom + 5}px`, // 5px below the item - exactly like user view
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
                  href={getVersionLink(version, card.id)}
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
                  to={getVersionLink(version, card.id)}
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
            key={card.id || index} 
            className="file-item-wrapper"
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
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
          </div>
        ))}
      </div>
      
      {/* Render version dialogue through portal */}
      {renderVersionDialogue()}
    </section>
  );
};

export default AdminOfficeSection;