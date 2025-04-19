import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/file.css";

function FilePageUser({ darkMode }) {
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
    const [showVersionList, setShowVersionList] = useState(false);

    // For development, use a hardcoded file URL
    // const sampleFileUrl = "http://localhost:5000/uploads/files/1744972682727-MDL_A4.pdf";

    const { id, versionID } = useParams();
    const navigate = useNavigate();

    /**
     * Fetch file data when component mounts
     */
    useEffect(() => {
        console.log("[filepage] useEffect triggered for ID: ", id);
        const fetchFile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/files/${id}`);
                console.log("[filePage] API response: ", response.status, response.data);

                if (!response.data.success) {
                    console.error("[filePage] API returned unsuccessful response: ", response.data);
                    throw new Error(response.data.error || "Failed to fetch file");
                }

                const fileData = response.data.data;
                setFile(fileData);

                const allVersions = [
                    {
                        _id: fileData._id,
                        name: fileData.name,
                        url: "http://localhost:5000/" + fileData.filePath,
                        filePath: fileData.filePath,
                        createdAt: fileData.createdAt,
                        status: fileData.status,
                        isCurrent: true,
                    },
                    ...(fileData.versions || []).map(version => ({
                        ...version,
                        url: "http://localhost:5000/" + version.filePath,
                    })),
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setVersions(allVersions);

                const latestApprovedVersion = allVersions.find(v => v._id === versionID);
                setSelectedVersion(latestApprovedVersion || allVersions[0]);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching file data:", err);
                setError(err.response?.data?.message || "Failed to load file. Please try again later.");
                setLoading(false);
            }
        };

        if (id) fetchFile();
    }, [id]);

    const handleVersionSelect = (version) => {
        setSelectedVersion(version);
        setShowVersionList(false);
    };

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Toggles comparison mode
     */
    const toggleCompareMode = () => {
        setCompareMode(!compareMode);
        if (!compareMode) {
            setVersion1(null);
            setVersion2(null);
        }
    };

    const handleCompare = async () => {
        if (!version1 || !version2) {
            alert('Please select two versions to compare.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/compare-pdfs', {
                pdf1Path: version1.filePath,
                pdf2Path: version2.filePath,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const newTab = window.open(`http://localhost:5000${response.data.htmlPath}`, '_blank');
                if (newTab) {
                    newTab.onbeforeunload = () => {
                        // Optionally notify the backend to delete the temp file
                    };
                } else {
                    alert('Pop-up blocked. Please allow pop-ups and try again.');
                }
            } else {
                alert('Failed to compare PDFs: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error comparing PDFs:', error);
            alert('An error occurred while comparing PDFs: ' + (error.response?.data?.message || error.message));
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading file...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
                <div className="error-message">
                    <h3>Error Loading File</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="file-header">
                <div className="file-info">
                    <h1>{selectedVersion?.name}</h1>
                    <div className="file-meta">
                        <span className="file-date">Last updated: {formatDate(selectedVersion?.createdAt)}</span>
                        <span className={`file-status ${selectedVersion?.status}`}>{selectedVersion?.status}</span>
                    </div>
                </div>
                <div className="file-actions">
                    <button 
                        className={`compare-toggle ${compareMode ? 'active' : ''}`}
                        onClick={toggleCompareMode}
                    >
                        {compareMode ? 'Exit Comparison' : 'Compare Versions'}
                    </button>
                    <button 
                        className="version-toggle"
                        onClick={() => setShowVersionList(!showVersionList)}
                    >
                        {showVersionList ? 'Hide Versions' : 'Show Versions'}
                    </button>
                </div>
            </div>

            <div className="file-content-wrapper">
                {showVersionList && (
                    <div className="version-sidebar">
                        <h3>File Versions</h3>
                        <div className="version-list">
                            {versions.map((version, index) => (
                                <div 
                                    key={version._id}
                                    className={`version-item ${selectedVersion?._id === version._id ? 'active' : ''}`}
                                    onClick={() => handleVersionSelect(version)}
                                >
                                    <div className="version-info">
                                        <span className="version-number">Version {versions.length - index}</span>
                                        <span className="version-date">{formatDate(version.createdAt)}</span>
                                    </div>
                                    <span className={`version-status ${version.status}`}>{version.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="main-content">
                    {compareMode ? (
                        <div className="comparison-view">
                            <div className="version-selectors">
                                <div className="version-selector">
                                    <label>Version 1</label>
                                    <select 
                                        value={version1?._id || ""}
                                        onChange={(e) => {
                                            const selected = versions.find(v => v._id === e.target.value);
                                            setVersion1(selected);
                                        }}
                                    >
                                        <option value="">Select a version</option>
                                        {versions.map((version) => (
                                            <option key={version._id} value={version._id}>
                                                Version {versions.length - versions.indexOf(version)} - {formatDate(version.createdAt)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="version-selector">
                                    <label>Version 2</label>
                                    <select 
                                        value={version2?._id || ""}
                                        onChange={(e) => {
                                            const selected = versions.find(v => v._id === e.target.value);
                                            setVersion2(selected);
                                        }}
                                    >
                                        <option value="">Select a version</option>
                                        {versions.map((version) => (
                                            <option key={version._id} value={version._id}>
                                                Version {versions.length - versions.indexOf(version)} - {formatDate(version.createdAt)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    className="compare-button"
                                    onClick={handleCompare}
                                    disabled={!version1 || !version2}
                                >
                                    Compare Selected Versions
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="file-viewer">
                            <object
                                data={selectedVersion?.url}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                className="pdf-viewer"
                            >
                                <p>It appears your browser doesn't support embedded PDFs.
                                    You can <a href={selectedVersion?.url} target="_blank" rel="noopener noreferrer">download the PDF</a> to view it.</p>
                            </object>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FilePageUser;
