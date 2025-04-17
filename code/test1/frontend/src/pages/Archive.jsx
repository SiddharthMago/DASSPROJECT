import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../css/archive.css';

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

          console.log('Raw response from my-files:', res.data);

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

          console.log('Mapped files:', mapped);
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

    console.log('Filtering item:', {
      item,
      matchesCategory,
      matchesOffice,
      matchesSearch,
      activeTab,
      selectedOffice,
      searchQuery
    });

    return matchesCategory && matchesOffice && matchesSearch;
  });

  console.log('Current state:', {
    archiveItems,
    filteredItems,
    activeTab,
    selectedOffice,
    searchQuery
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
      <header className="archive-header">
        <h1 className="page-title">Archive</h1>
      </header>

      {/* Controls: Search and Office Filter */}
      <center className="archive-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">🔍</button>
        </div>

        <div className="office-filter">
          <label htmlFor="office-filter">Office: </label>
          <select
            id="office-filter"
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
          >
            <option value="">All</option>
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
      </center>

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

      {/* Archive Table */}
      <section className="archive-table">
        <div className="table-header">
          <div className="header-row">
            <div className="file-name-col">FILE NAME</div>
            <div className="table-divider">|</div>
            <div className="author-col">AUTHOR</div>
            <div className="table-divider">|</div>
            <div className="office-col">OFFICE</div>
            <div className="table-divider">|</div>
            <div className="date-col">UPLOAD DATE</div>
            <div className="table-divider">|</div>
            {activeTab === 'Uploaded by Me' ? (
              <>
                <div className="status-col">STATUS</div>
                <div className="table-divider">|</div>
                <div className="preview-col">PREVIEW</div>
                <div className="table-divider">|</div>
                <div className="action-col">DOWNLOAD</div>
              </>
            ) : (
              <>
                <div className="preview-col">PREVIEW</div>
                <div className="table-divider">|</div>
                <div className="action-col">DOWNLOAD</div>
              </>
            )}
          </div>
        </div>

        <div className="table-rows">
          {filteredItems.map((item) => (
            <React.Fragment key={item.id}>
              <article className="table-row">
                <div className="file-name">{item.fileName}</div>
                <div className="table-divider">|</div>
                <div className="author">{item.author}</div>
                <div className="table-divider">|</div>
                <div className="office">{item.office}</div>
                <div className="table-divider">|</div>
                <div className="upload-date">{item.modifiedDate}</div>
                <div className="table-divider">|</div>
                {activeTab === 'Uploaded by Me' && (
                  <>
                    <div 
                      className={`status ${item.status} ${item.status === 'rejected' ? 'clickable' : ''}`}
                      onClick={() => item.status === 'rejected' && toggleComments(item.id)}
                    >
                      {item.status}
                    </div>
                    <div className="table-divider">|</div>
                  </>
                )}
                <div className="preview">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.downloadUrl) {
                        window.open(item.downloadUrl, '_blank');
                      }
                    }}
                    className="preview-link"
                  >
                    Preview
                  </a>
                </div>
                <div className="table-divider">|</div>
                <div className="download">
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    Download
                  </a>
                </div>
              </article>
              {activeTab === 'Uploaded by Me' && item.status === 'rejected' && expandedFileId === item.id && (
                <div className="comments-dropdown">
                  <div className="comments-header">Rejection Comments</div>
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment, index) => (
                      <div key={index} className="comment-item">
                        <div className="comment-author">
                          {comment.author?.name || 'Unknown'}: 
                        </div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="comment-item">No comments available</div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
          {filteredItems.length === 0 && (
            <p className="no-results">No archive items found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Archive;
