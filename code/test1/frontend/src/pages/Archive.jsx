import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../css/archive.css';
import { FaTh, FaList } from 'react-icons/fa';

function Archive({ darkMode, userRole }) {
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('All');
  const [activeTab, setActiveTab] = useState('All');
  const [archiveItems, setArchiveItems] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' or 'table'

  // Set active tab from URL parameter on component mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['All', 'Files', 'Announcements', 'Links', 'Events'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'All') {
          // Fetch all types of content
          const [filesRes, announcementsRes, quickLinksRes] = await Promise.all([
            axios.get('http://localhost:5000/api/files/approved'),
            axios.get('http://localhost:5000/api/announcements'),
            axios.get('http://localhost:5000/api/quicklinks')
          ]);

          const files = filesRes.data.data.map((file) => ({
            id: file._id,
            fileName: file.name,
            author: file.authorName,
            office: file.office,
            modifiedDate: new Date(file.createdAt).toLocaleDateString(),
            category: 'Files',
            downloadUrl: file.url || `http://localhost:5000/${file.filePath?.replace(/\\/g, '/')}`,
          }));

          const announcements = announcementsRes.data.data.map((announcement) => ({
            id: announcement._id,
            fileName: announcement.title,
            author: announcement.office,
            office: announcement.office,
            modifiedDate: new Date(announcement.createdAt).toLocaleDateString(),
            category: 'Announcements',
            downloadUrl: announcement.link || '#',
            image: announcement.image
          }));

          const quickLinks = quickLinksRes.data.data.map((quickLink) => ({
            id: quickLink._id,
            fileName: quickLink.title,
            author: quickLink.office,
            office: quickLink.office,
            modifiedDate: new Date(quickLink.createdAt).toLocaleDateString(),
            category: 'Links',
            downloadUrl: quickLink.url,
            pinned: quickLink.pinned
          }));

          // Combine all items and sort by date
          const allItems = [...files, ...announcements, ...quickLinks].sort((a, b) => 
            new Date(b.modifiedDate) - new Date(a.modifiedDate)
          );
          setArchiveItems(allItems);
        } else if (activeTab === 'Files') {
          const res = await axios.get('http://localhost:5000/api/files/approved');
          const mapped = res.data.data.map((file) => ({
            id: file._id,
            fileName: file.name,
            author: file.author?.name || 'Unknown',
            office: file.office,
            modifiedDate: new Date(file.createdAt).toLocaleDateString(),
            category: 'Files',
            downloadUrl: file.url || `http://localhost:5000/${file.filePath?.replace(/\\/g, '/')}`,
          }));
          setArchiveItems(mapped);
        } else if (activeTab === 'Uploaded by Me') {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found');
            setError('Please log in to view your uploaded files');
            return;
          }

          const res = await axios.get('http://localhost:5000/api/files/my-files', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!res.data.success) {
            console.error('Failed to fetch user files:', res.data.error);
            setError('Failed to fetch your uploaded files');
            return;
          }

          const mapped = res.data.data.map((file) => ({
            id: file._id,
            fileName: file.name,
            author: file.author?.name || 'Unknown',
            office: file.office,
            modifiedDate: new Date(file.createdAt).toLocaleDateString(),
            category: 'Files',
            status: file.status,
            comments: file.comments || [],
            downloadUrl: file.url || `http://localhost:5000/${file.filePath?.replace(/\\/g, '/')}`,
          }));
          setArchiveItems(mapped);
        } else if (activeTab === 'Announcements') {
          const res = await axios.get('http://localhost:5000/api/announcements');
          const mapped = res.data.data.map((announcement) => ({
            id: announcement._id,
            fileName: announcement.title,
            author: announcement.office,
            office: announcement.office,
            modifiedDate: new Date(announcement.createdAt).toLocaleDateString(),
            category: 'Announcements',
            downloadUrl: announcement.link || '#',
            image: announcement.image
          }));
          setArchiveItems(mapped);
        } else if (activeTab === 'Links') {
          const res = await axios.get('http://localhost:5000/api/quicklinks');
          const mapped = res.data.data.map((quickLink) => ({
            id: quickLink._id,
            fileName: quickLink.title,
            author: quickLink.office,
            office: quickLink.office,
            modifiedDate: new Date(quickLink.createdAt).toLocaleDateString(),
            category: 'Links',
            downloadUrl: quickLink.url,
            pinned: quickLink.pinned
          }));
          setArchiveItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Filter items based on search query, office selection, and active tab
  const filteredItems = archiveItems.filter((item) => {
    const matchesCategory = activeTab === 'All' || 
      (activeTab === 'Uploaded by Me' ? item.category === 'Files' : item.category === activeTab);
    const matchesOffice =
      selectedOffice === 'All' || item.office.toLowerCase().includes(selectedOffice.toLowerCase());
    const matchesSearch =
      searchQuery === '' || item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesOffice && matchesSearch;
  });

  const toggleComments = (fileId) => {
    setExpandedFileId(expandedFileId === fileId ? null : fileId);
  };

  return (
    <div className={`archive-container ${darkMode ? 'dark-mode' : ''}`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
      />
      
      {/* Header Section */}
      <header className="archive-header">
        <h1 className="page-title">Archive</h1>
        <p className="page-subtitle">Browse and access all institutional resources</p>
      </header>

      {/* Layout Toggle */}
      <div className="layout-toggle">
        <button
          className={layout === 'grid' ? 'active' : ''}
          onClick={() => setLayout('grid')}
          title="Grid View"
        >
          <FaTh />
        </button>
        <button
          className={layout === 'table' ? 'active' : ''}
          onClick={() => setLayout('table')}
          title="Table View"
        >
          <FaList />
        </button>
      </div>

      {/* Search and Filter Section */}
      <section className="archive-filters">
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <div className="office-filter">
              <label htmlFor="office-filter">Office: </label>
              <select
                id="office-filter"
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
              >
                <option value="All">All Offices</option>
                <option value="Admissions Office">Admissions Office</option>
                <option value="Library Office">Library Office</option>
                <option value="Examinations Office">Examinations Office</option>
                <option value="Academic Office">Academic Office</option>
                <option value="Student Affairs Office">Student Affairs Office</option>
                <option value="Mess Office">Mess Office</option>
                <option value="Hostel Office">Hostel Office</option>
                <option value="Alumni Cell">Alumni Cell</option>
                <option value="Faculty Portal">Faculty Portal</option>
                <option value="Placement Cell">Placement Cell</option>
                <option value="Outreach Office">Outreach Office</option>
                <option value="Statistical Cell">Statistical Cell</option>
                <option value="R&D Office">R&D Office</option>
                <option value="General Administration">General Administration</option>
                <option value="Accounts Office">Accounts Office</option>
                <option value="IT Services Office">IT Services Office</option>
                <option value="Communication Office">Communication Office</option>
                <option value="Engineering Office">Engineering Office</option>
                <option value="HR & Personnel">HR & Personnel</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <nav className="category-tabs">
        <ul className="tab-list">
          {['All', 'Files', 'Announcements', 'Links', 'Events'].map((tab) => (
            <li key={tab}>
              <button
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <li>
              <button
                className={`tab-button ${activeTab === 'Uploaded by Me' ? 'active' : ''}`}
                onClick={() => setActiveTab('Uploaded by Me')}
              >
                Uploaded by Me
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Content Section */}
      <section className="archive-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading archive items...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No items found matching your criteria</p>
          </div>
        ) : layout === 'grid' ? (
          <div className="archive-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="archive-card">
                <div className="card-header">
                  <h3 className="card-title">{item.fileName}</h3>
                  <span className={`card-category ${item.category.toLowerCase()}`}>
                    {item.category}
                  </span>
                </div>
                
                <div className="card-content">
                  <div className="card-info">
                    <div className="info-row">
                      <span className="info-label">Author:</span>
                      <span className="info-value">{item.author}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Office:</span>
                      <span className="info-value">{item.office}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{item.modifiedDate}</span>
                    </div>
                    {activeTab === 'Uploaded by Me' && (
                      <div className="info-row">
                        <span className="info-label">Status:</span>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="action-button preview"
                    onClick={() => window.open(item.downloadUrl, '_blank')}
                  >
                    Preview
                  </button>
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button download"
                  >
                    Download
                  </a>
                </div>

                {activeTab === 'Uploaded by Me' && item.status === 'rejected' && (
                  <div className="comments-section">
                    <button 
                      className="comments-toggle"
                      onClick={() => toggleComments(item.id)}
                    >
                      View Rejection Comments
                    </button>
                    {expandedFileId === item.id && (
                      <div className="comments-content">
                        {item.comments && item.comments.length > 0 ? (
                          item.comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-author">
                                  {comment.author?.name || 'Unknown'}
                                </span>
                                <span className="comment-date">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="comment-text">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="no-comments">No comments available</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="archive-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Author</th>
                <th>Office</th>
                <th>Date</th>
                {activeTab === 'Uploaded by Me' && <th>Status</th>}
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="name-cell">{item.fileName}</td>
                  <td className="category-cell">
                    <span className={`category-badge ${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="author-cell">{item.author}</td>
                  <td className="office-cell">{item.office}</td>
                  <td className="date-cell">{item.modifiedDate}</td>
                  {activeTab === 'Uploaded by Me' && (
                    <td className="status-cell">
                      <div className="status-container">
                        <span className={`status-badge ${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                        {item.status?.toLowerCase() === 'rejected' && item.comments && (
                          <button 
                            className="comments-toggle"
                            onClick={() => toggleComments(item.id)}
                          >
                            View Comments
                          </button>
                        )}
                      </div>
                      {expandedFileId === item.id && item.comments && (
                        <div className="comments-content">
                          {item.comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-author">
                                  {comment.author?.name || 'Unknown'}
                                </span>
                                <span className="comment-date">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="comment-text">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="actions-cell">
                    <div className="card-actions">
                      <button 
                        className="action-button preview"
                        onClick={() => window.open(item.downloadUrl, '_blank')}
                      >
                        Preview
                      </button>
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button download"
                      >
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Archive;
