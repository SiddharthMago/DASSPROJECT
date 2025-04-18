import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/file.css";

/**
 * FilePageUser Component
 * 
 * A page component for displaying a single file with version history and comparison feature.
 * Features:
 * - Sidebar with version history
 * - Main content area for file display
 * - Version comparison option below the file viewer
 * 
 * @param {Object} props
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {string} props.fileID - ID of the file to display
 */
function FilePageUser({ darkMode, fileID }) {
    // State for file data
    const [file, setFile] = useState(null);
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States for file comparison
    const [compareMode, setCompareMode] = useState(false);
    const [version1, setVersion1] = useState(null);
    const [version2, setVersion2] = useState(null);
    
    // For development, use a hardcoded file URL
    const sampleFileUrl = "http://localhost:5000/uploads/files/1744972682727-MDL_A4.pdf";

    /**
     * Fetch file data when component mounts
     */
    useEffect(() => {
        const fetchFile = async () => {
            try {
                setLoading(true);
                
                // In a real implementation with actual API:
                let response;
                let fileData;
                
                try {
                    // Try to fetch from the actual API endpoint
                    response = await axios.get(`/api/files/${fileID || 'sample'}`);
                    fileData = response.data.data;
                } catch (apiError) {
                    console.warn("API fetch failed, using sample data", apiError);
                    
                    // Fallback to sample data
                    fileData = {
                        _id: "sample-id",
                        name: "MDL_A4.pdf",
                        url: sampleFileUrl,
                        filePath: "/uploads/files/1744972682727-MDL_A4.pdf",
                        createdAt: new Date().toISOString(),
                        // Note: In the real API implementation, versions would come from the database
                        versions: []
                    };
                }
                
                setFile(fileData);
                
                // Combine current version with past versions for display
                // The current file itself is considered the latest version
                const allVersions = [
                    {
                        _id: fileData._id,
                        name: fileData.name,
                        url: fileData.url || sampleFileUrl, // Fallback for development
                        filePath: fileData.filePath,
                        createdAt: fileData.createdAt,
                        isCurrent: true
                    },
                    ...(fileData.versions || []) // Add any previous versions if they exist
                ];
                
                setVersions(allVersions);
                setSelectedVersion(allVersions[0]); // Select latest version by default
                
                // Initialize comparison versions if there are multiple versions
                if (allVersions.length >= 2) {
                    setVersion1(allVersions[0]);
                    setVersion2(allVersions[1]);
                } else if (allVersions.length === 1) {
                    setVersion1(allVersions[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching file data:", err);
                setError("Failed to load file. Please try again later.");
                setLoading(false);
            }
        };
        
        fetchFile();
    }, [fileID, sampleFileUrl]);

    /**
     * Format a date in a readable way
     * 
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    /**
     * Toggles comparison mode
     */
    const toggleCompareMode = () => {
        setCompareMode(!compareMode);
    };

    /**
     * FileVersions Component - Shows available file versions in sidebar
     * 
     * @param {Object} props
     * @param {Array} props.versions - List of file versions
     * @param {Function} props.onVersionSelect - Callback when version is selected
     * @param {Object} props.selectedVersion - Currently selected version
     */
    function FileVersions({ versions, onVersionSelect, selectedVersion }) {
        if (!versions || versions.length === 0) {
            return (
                <section className="file-ver">
                    <h2 className="file-ver-heading">File Versions</h2>
                    <p className="no-versions">No versions available</p>
                </section>
            );
        }

        return (
            <section className="file-ver">
                <h2 className="file-ver-heading">File Versions</h2>
                <div className="version-list-container">
                    <ul>
                        {versions.map((version, index) => (
                            <li key={version._id || index}>
                                <button 
                                    className={selectedVersion?._id === version._id ? 'active' : ''}
                                    onClick={() => onVersionSelect(version)}
                                >
                                    <span className="version-date">
                                        {formatDate(version.createdAt)}
                                    </span>
                                    {version.isCurrent && <span className="version-current">(Current)</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        );
    }

    /**
     * FileContent Component - Displays the actual file content
     * 
     * @param {Object} props
     * @param {Object} props.version - Version to display
     */
    function FileContent({ version }) {
        if (!version) return <div className="file-content empty">No file selected</div>;
        
        return (
            <article className="file-content">
                <div className="file-header">
                    <h1 className="file-title">{version.name}</h1>
                    <p className="file-date">
                        Last updated: {formatDate(version.createdAt)}
                    </p>
                </div>
                
                <div className="document">
                    <object 
                        data={version.url} 
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="file-object"
                    >
                        <p>It appears your browser doesn't support embedded PDFs. 
                        You can <a href={version.url} target="_blank" rel="noopener noreferrer">download the PDF</a> to view it.</p>
                    </object>
                </div>
            </article>
        );
    }

    /**
     * VersionSelector - Dropdown to select a version for comparison
     * 
     * @param {Object} props
     * @param {Array} props.versions - Available versions
     * @param {Object} props.selectedVersion - Currently selected version
     * @param {Function} props.onVersionChange - Handler for version change
     * @param {string} props.label - Label for the selector
     */
    function VersionSelector({ versions, selectedVersion, onVersionChange, label }) {
        return (
            <div className="version-selector">
                <label>{label}</label>
                <select 
                    value={selectedVersion ? selectedVersion._id : ''}
                    onChange={(e) => {
                        const selected = versions.find(v => v._id === e.target.value);
                        onVersionChange(selected);
                    }}
                >
                    {versions.map((version) => (
                        <option key={version._id} value={version._id}>
                            {formatDate(version.createdAt)}
                            {version.isCurrent ? " (Current)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    /**
     * ComparisonView - Shows two versions side by side
     * 
     * @param {Object} props
     * @param {Object} props.version1 - First version to compare
     * @param {Object} props.version2 - Second version to compare
     */
    function ComparisonView({ version1, version2 }) {
        if (!version1 || !version2) {
            return <div className="comparison-error">Please select two versions to compare</div>;
        }

        return (
            <div className="comparison-container">
                <div className="comparison-header">
                    <h2>Version Comparison</h2>
                </div>
                
                <div className="comparison-content">
                    <div className="comparison-version">
                        <h3>{formatDate(version1.createdAt)} {version1.isCurrent && "(Current)"}</h3>
                        <div className="comparison-frame">
                            <object
                                data={version1.url}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                className="comparison-object"
                            >
                                <p>PDF cannot be displayed</p>
                            </object>
                        </div>
                    </div>
                    
                    <div className="comparison-version">
                        <h3>{formatDate(version2.createdAt)} {version2.isCurrent && "(Current)"}</h3>
                        <div className="comparison-frame">
                            <object
                                data={version2.url}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                className="comparison-object"
                            >
                                <p>PDF cannot be displayed</p>
                            </object>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * ComparisonControl - Controls for version comparison
     */
    function ComparisonControl() {
        const hasMultipleVersions = versions.length > 1;
        
        if (!hasMultipleVersions) {
            return null;
        }
        
        return (
            <div className="comparison-control">
                <div className="comparison-toggle">
                    <button 
                        onClick={toggleCompareMode}
                        className={compareMode ? 'active' : ''}
                    >
                        {compareMode ? 'Hide Comparison' : 'Compare Versions'}
                    </button>
                </div>
                
                {compareMode && (
                    <div className="comparison-selectors">
                        <VersionSelector
                            versions={versions}
                            selectedVersion={version1}
                            onVersionChange={setVersion1}
                            label="Version 1:"
                        />
                        <VersionSelector
                            versions={versions}
                            selectedVersion={version2}
                            onVersionChange={setVersion2}
                            label="Version 2:"
                        />
                    </div>
                )}
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
                <div className="loading-spinner">Loading file...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
            <link
                href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            
            <section className="view-file">
                <aside className="side-menu">
                    {/* Only include the versions sidebar */}
                    <FileVersions 
                        versions={versions} 
                        onVersionSelect={setSelectedVersion} 
                        selectedVersion={selectedVersion}
                    />
                </aside>
                <div className="main-content">
                    {/* Main file content */}
                    <FileContent version={selectedVersion} />
                    
                    {/* Comparison controls */}
                    <ComparisonControl />
                    
                    {/* Version comparison view (shown only in compare mode) */}
                    {compareMode && version1 && version2 && (
                        <ComparisonView version1={version1} version2={version2} />
                    )}
                </div>
            </section>
        </div>
    );
}

export default FilePageUser;
