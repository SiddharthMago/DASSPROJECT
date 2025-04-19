"use client";
import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/file_upload.css';

function FileUpload({ darkMode }) {
  const location = useLocation();
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileUrl, setFileUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State for user information
  const [userOffice, setUserOffice] = useState("");
  const [userRole, setUserRole] = useState("");
  
  // State for offices (for superadmin)
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");
  
  // State for categories
  const [existingCategories, setExistingCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  
  // State for files in the selected office/category and version handling
  const [categoryFiles, setCategoryFiles] = useState([]);
  const [allOfficeFiles, setAllOfficeFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [isNewVersion, setIsNewVersion] = useState(false);

  // Parse URL parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const officeParam = queryParams.get('office');
    const categoryParam = queryParams.get('category');
    const fileIdParam = queryParams.get('fileId');
    const isNewVersionParam = queryParams.get('isNewVersion');
    
    if (officeParam) {
      console.log('Office from URL:', officeParam);
    }
    
    if (categoryParam) {
      console.log('Category from URL:', categoryParam);
      setSelectedCategory(categoryParam);
    }

    if (fileIdParam) {
      console.log('File ID from URL:', fileIdParam);
      setSelectedFile(fileIdParam);
    }

    if (isNewVersionParam === 'true') {
      console.log('New version mode enabled from URL');
      setIsNewVersion(true);
    }
  }, [location]);

  // Fetch user profile and offices when component mounts
  useEffect(() => {
    const fetchUserProfileAndOffices = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user profile
        const userResponse = await axios.get('/api/auth_cas/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Add logging to understand the response
        console.log('User Profile Response:', userResponse.data);
        
        // Safely extract office and role
        const office = userResponse.data.office;
        const role = userResponse.data.role;
        
        if (!office) {
          throw new Error('Office not found in user profile');
        }
        
        setUserOffice(office);
        setUserRole(role);
        
        // Parse URL parameters again (now that we have user data)
        const queryParams = new URLSearchParams(location.search);
        const officeParam = queryParams.get('office');
        
        // Set the selected office based on URL or user's default
        if (officeParam && (role === 'superadmin' || officeParam === office)) {
          setSelectedOffice(officeParam);
        } else {
          setSelectedOffice(office); // Default to user's office
        }
        
        // If superadmin, set all available offices from the User model enum
        if (role === 'superadmin') {
          // Use the complete list of offices from the User model schema
          const allOffices = [
            'Admissions Office',
            'Library Office',
            'Examinations Office',
            'Academic Office',
            'Student Affairs Office',
            'Mess Office',
            'Hostel Office',
            'Alumni Cell',
            'Faculty Portal',
            'Placement Cell',
            'Outreach Office',
            'Statistical Cell',
            'R&D Office',
            'General Administration',
            'Accounts Office',
            'IT Services Office',
            'Communication Office',
            'Engineering Office',
            'HR & Personnel'
          ];
          
          setOffices(allOffices);
          console.log('Set all available offices for superadmin');
        }
        
        // Fetch existing categories for this office
        // Use selected office (from URL or user profile)
        const officeToUse = officeParam && (role === 'superadmin' || officeParam === office) 
          ? officeParam 
          : office;
          
        await fetchCategories(officeToUse, token);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // More detailed error handling
        const errorMsg = error.response?.data?.error || 
                         error.message || 
                         'Could not fetch user profile';
        
        setErrorMessage(errorMsg);
        
        // Optional: Provide a fallback or prompt user to update profile
        setUserOffice('Unknown Office');
      }
    };
  
    fetchUserProfileAndOffices();
  }, [location]);

  // Function to fetch categories for an office
  const fetchCategories = async (office, token) => {
    if (!office) return;
    
    try {
      const categoriesResponse = await axios.get(`/api/files/categories/${encodeURIComponent(office)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setExistingCategories(categoriesResponse.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setExistingCategories([]);
    }
  };

  // Handle office change (for superadmin)
  const handleOfficeChange = async (office) => {
    setSelectedOffice(office);
    setSelectedCategory('');
    
    const token = localStorage.getItem('token');
    await fetchCategories(office, token);
    
    // Also fetch all files for this office
    await fetchAllFilesInOffice(office);
  };

  // Fetch all files for an office
  const fetchAllFilesInOffice = async (office) => {
    if (!office) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/files/office/${encodeURIComponent(office)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: 'approved'
        }
      });
      
      setAllOfficeFiles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching all office files:', error);
      setAllOfficeFiles([]);
    }
  };

  // Fetch files when category changes
  useEffect(() => {
    const fetchFilesInCategory = async () => {
      if (!selectedCategory || !selectedOffice) return;
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch files for the selected category and office
        const response = await axios.get(`/api/files/office/${encodeURIComponent(selectedOffice)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            category: selectedCategory,
            status: 'approved'
          }
        });
        
        // Filter files to only include those in the selected category
        const filesInCategory = response.data.data.filter(
          file => file.category === selectedCategory
        );
        
        setCategoryFiles(filesInCategory);
      } catch (error) {
        console.error('Error fetching files in category:', error);
        setCategoryFiles([]);
      }
    };
    
    fetchFilesInCategory();
  }, [selectedCategory, selectedOffice]);

  // Fetch all files in the office when component mounts or office changes
  useEffect(() => {
    fetchAllFilesInOffice(selectedOffice);
  }, [selectedOffice]);

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      setErrorMessage("Category name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Add new category
      const response = await axios.post('/api/files/categories', 
        {
          office: selectedOffice,
          category: newCategory.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update existing categories
      setExistingCategories(response.data.categories);
      
      // Select the newly added category
      setSelectedCategory(newCategory.trim());
      
      // Clear new category input
      setNewCategory("");
      
      // Show success message
      setSuccessMessage("New category added successfully");
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error adding new category:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to add new category');
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging],
  );

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setFileName(e.dataTransfer.files[0].name);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setFileName(e.target.files[0].name);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validation checks
      if (files.length === 0 && !fileUrl.trim()) {
        setErrorMessage('Please select a file or provide a URL.');
        return;
      }

      if (!selectedOffice) {
        setErrorMessage('Please select an office.');
        return;
      }

      // For new files (not versions), category is required
      if (!isNewVersion && !selectedCategory) {
        setErrorMessage('Please select or create a category.');
        return;
      }

      // For new versions, file selection is required
      if (isNewVersion && !selectedFile) {
        setErrorMessage('Please select an existing file.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        if (isNewVersion && selectedFile) {
          // Handle version upload
          const formData = new FormData();
          
          if (files.length > 0) {
            formData.append('file', files[0]);
          }
          
          formData.append('name', fileName || files[0]?.name || fileUrl);
          
          if (fileUrl.trim()) {
            formData.append('url', fileUrl.trim());
          }

          const response = await axios.post(`/api/files/${selectedFile}/version`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });

          setSuccessMessage("New version sent for approval");
        } else {
          // Handle new file upload
          const formData = new FormData();
          
          if (files.length > 0) {
            formData.append('file', files[0]); 
          }
          
          formData.append('name', fileName || files[0]?.name || fileUrl);
          formData.append('office', selectedOffice); 
          formData.append('category', selectedCategory);
          
          if (fileUrl.trim()) {
            formData.append('url', fileUrl.trim());
          }

          const response = await axios.post('/api/files/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });

          setSuccessMessage("File or URL sent for approval");
        }
        
        setTimeout(() => {
          setSuccessMessage("");
          setErrorMessage("");
        }, 3000);

        // Reset all fields
        setFileName('');
        setFileUrl('');
        setFiles([]);
        setSelectedCategory('');
        setSelectedFile('');
        setIsNewVersion(false);
      } catch (error) {
        console.error('Error uploading file/URL:', error);
        
        const errorMsg = error.response?.data?.error || 'Failed to upload file/URL';
        setErrorMessage(errorMsg);

        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    },
    [files, fileName, fileUrl, selectedOffice, selectedCategory, isNewVersion, selectedFile]
  );

  // Handler to remove a file from the list
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    if (newFiles.length > 0) {
      setFileName(newFiles[0].name);
    } else {
      setFileName("");
    }
  };

  // Toggle for new version option
  const toggleVersionUpload = (e) => {
    const newVersionState = e.target.checked;
    setIsNewVersion(newVersionState);
    
    if (!newVersionState) {
      // When turning off new version option, clear the selected file
      setSelectedFile("");
    } else {
      // When turning on new version option, fetch all files for the office
      fetchAllFilesInOffice(selectedOffice);
      
      // Note: We keep the selected category when toggling between modes
      // This allows filtering by the same category when switching to version mode
    }
  };

  // Fetch file details when a file is selected
  useEffect(() => {
    const fetchFileDetails = async () => {
      if (!selectedFile) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/files/${selectedFile}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const fileData = response.data.data;
          setSelectedOffice(fileData.office);
          setSelectedCategory(fileData.category);
          // setFileName(fileData.name);
        }
      } catch (error) {
        console.error('Error fetching file details:', error);
      }
    };

    fetchFileDetails();
  }, [selectedFile]);

  return (
    <div className={`upload-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <svg className="message-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
          </svg>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          <svg className="message-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
          </svg>
          {errorMessage}
        </div>
      )}

      <div className="upload-container">
        {/* Header Section */}
        <header className="archive-header">
          <div className="header-content">
            <h1 className="page-title">ADD FILES</h1>
            <p className="page-subtitle">Upload new files or add new versions of existing files</p>
          </div>
        </header>

        <section className="upload-content">
          <div className="upload-grid">
            {/* Form Section */}
            <div className="upload-form-container">
              <form className="upload-form" onSubmit={handleSubmit}>
                {/* File Name Input */}
                <div className="form-group">
                  <label className="form-label">File/Resource Name:</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
                    </svg>
                    <input
                      type="text"
                      className="form-input"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter file or resource name"
                    />
                  </div>
                </div>

                {/* URL Input */}
                <div className="form-group">
                  <label className="form-label">URL (Optional):</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
                    </svg>
                    <input
                      type="url"
                      className="form-input"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="Enter URL of the resource"
                    />
                  </div>
                </div>

                {/* Office Selection (for superadmin) or Display (for admin) */}
                <div className="form-group">
                  <label className="form-label">Office:</label>
                  {userRole === 'superadmin' ? (
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="currentColor"/>
                      </svg>
                      <select 
                        value={selectedOffice} 
                        onChange={(e) => handleOfficeChange(e.target.value)}
                        className="form-select"
                      >
                        <option value="">-- Select Office --</option>
                        {offices.map((office, index) => (
                          <option key={index} value={office}>
                            {office}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="office-value">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="currentColor"/>
                      </svg>
                      {userOffice}
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                <div className="form-group">
                  <label className="form-label">
                    {isNewVersion ? "Filter by Category (Optional):" : "Select Category:"}
                  </label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/>
                    </svg>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="form-select"
                    >
                      <option value="">
                        {isNewVersion ? "-- All Categories --" : "-- Select Category --"}
                      </option>
                      {existingCategories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* New Category Input */}
                {!isNewVersion && (
                  <div className="form-group">
                    <label className="form-label">Add New Category:</label>
                    <div className="input-group">
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
                        </svg>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Enter new category"
                          className="form-input"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddNewCategory}
                        className="form-button secondary-button"
                      >
                        <svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* New Version Toggle */}
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isNewVersion}
                      onChange={toggleVersionUpload}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    Add as a new version of an existing file
                  </label>
                </div>

                {/* File Selection for New Version */}
                {isNewVersion && (
                  <div className="form-group">
                    <label className="form-label">Select Existing File:</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
                      </svg>
                      <select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        className="form-select"
                        disabled={!selectedOffice || 
                          (selectedCategory ? categoryFiles.length === 0 : allOfficeFiles.length === 0)}
                      >
                        <option value="">-- Select File --</option>
                        {selectedCategory 
                          ? categoryFiles.map((file) => (
                              <option key={file._id} value={file._id}>
                                {file.name} ({file.category})
                              </option>
                            ))
                          : allOfficeFiles.map((file) => (
                              <option key={file._id} value={file._id}>
                                {file.name} ({file.category})
                              </option>
                            ))
                        }
                      </select>
                    </div>
                    {selectedOffice && 
                      (selectedCategory 
                        ? categoryFiles.length === 0 && <p className="help-text">No existing files in this category</p>
                        : allOfficeFiles.length === 0 && <p className="help-text">No existing files in this office</p>
                      )
                    }
                  </div>
                )}

                {/* Submit Button */}
                <button type="submit" className="form-button primary-button submit-button">
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  {isNewVersion ? "SUBMIT NEW VERSION" : "SUBMIT FOR APPROVAL"}
                </button>
              </form>
            </div>

            {/* Dropzone Section */}
            <div className="dropzone-container">
              <div
                className={`dropzone ${isDragging ? "dragging" : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
              >
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="dropzone-text">
                    <span>DRAG AND DROP</span>
                    <br />
                    <span>OR</span>
                    <br />
                    <span>CLICK TO UPLOAD FILES</span>
                  </p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>

              {/* Display uploaded files if any */}
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-item-content">
                        <svg className="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
                        </svg>
                        <span className="file-item-name">{file.name}</span>
                      </div>
                      <button
                        className="file-item-remove"
                        onClick={() => removeFile(index)}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FileUpload;