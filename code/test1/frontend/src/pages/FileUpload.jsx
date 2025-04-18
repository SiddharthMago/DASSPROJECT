"use client";
import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import axios from 'axios';
import '../css/file_upload.css';  // Import the external CSS file

const FileUpload = ({ darkMode }) => {
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
        setSelectedOffice(office); // Default selected office to user's office
        
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
        await fetchCategories(office, token);
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
  }, []);

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

          setSuccessMessage("New version added successfully");
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

  return (
    <div className={`upload-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      <div className="upload-container">
        <header className="upload-header">ADD FILES</header>
        <section className="upload-content">
          <form className="upload-form" onSubmit={handleSubmit}>
            {/* File Name Input */}
            <div className="form-group">
            <label className="form-label">File/Resource Name:</label>
            <input
              type="text"
              className="form-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file or resource name"
            />
            </div>

            {/* URL Input */}
            <div className="form-group">
            <label className="form-label">URL (Optional):</label>
            <input
              type="url"
              className="form-input"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="Enter URL of the resource"
            />
            </div>

            {/* Office Selection (for superadmin) or Display (for admin) */}
            <div className="form-group">
              <label className="form-label">Office:</label>
              {userRole === 'superadmin' ? (
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
              ) : (
                <div className="office-value">{userOffice}</div>
              )}
            </div>

            {/* Category Selection (used for both new files and filtering) */}
            <div className="form-group">
              <label className="form-label">
                {isNewVersion ? "Filter by Category (Optional):" : "Select Category:"}
              </label>
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

            {/* New Category Input (only shown when not adding a new version) */}
            {!isNewVersion && (
              <div className="form-group">
                <label className="form-label">Add New Category:</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category"
                    className="form-input"
                  />
                  <button 
                    type="button"
                    onClick={handleAddNewCategory}
                    className="form-button secondary-button"
                  >
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
                Add as a new version of an existing file
              </label>
            </div>

            {/* File Selection for New Version (only shown when adding a new version) */}
            {isNewVersion && (
              <div className="form-group">
                <label className="form-label">Select Existing File:</label>
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
              {isNewVersion ? "SUBMIT NEW VERSION" : "SUBMIT FOR APPROVAL"}
            </button>
          </form>

          <div className="dropzone-container">
            <div
                className={`dropzone ${isDragging ? "dragging" : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
              >
              <p className="dropzone-text">
                <span>DRAG AND DROP</span>
                <br />
                <span>OR</span>
                <br />
                <span>CLICK TO UPLOAD FILES</span>
              </p>
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
                    <span className="file-item-name">{file.name}</span>
                    <button
                      className="file-item-remove"
                      onClick={() => removeFile(index)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FileUpload;