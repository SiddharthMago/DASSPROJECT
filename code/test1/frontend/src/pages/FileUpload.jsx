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

  // State for office and categories
  const [userOffice, setUserOffice] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Fetch user office and categories when component mounts
  useEffect(() => {
    const fetchUserOfficeAndCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user profile with full URL and CORS headers
        const userResponse = await axios.get('http://localhost:5000/api/auth_cas/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true // Add this
        });
        
        // Add logging to understand the response
        console.log('User Profile Response:', userResponse.data);
        
        // Safely extract office
        const office = userResponse.data.office;
        
        if (!office) {
          throw new Error('Office not found in user profile');
        }
        
        setUserOffice(office);
        
        // Fetch existing categories for this office
        const categoriesResponse = await axios.get(`http://localhost:5000/api/files/categories/${encodeURIComponent(office)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true // Add this
        });
        
        setExistingCategories(categoriesResponse.data.categories || []);
      } catch (error) {
        console.error('Error fetching user office or categories:', error);
        
        // More detailed error handling
        const errorMsg = error.response?.data?.error || 
                         error.message || 
                         'Could not fetch user office or categories';
        
        setErrorMessage(errorMsg);
        
        // Optional: Provide a fallback or prompt user to update profile
        setUserOffice('Unknown Office');
      }
    };
  
    fetchUserOfficeAndCategories();
  }, []);

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      setErrorMessage("Category name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Add new category
      const response = await axios.post('http://localhost:5000/api/files/categories', 
        {
          office: userOffice,
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

      if (!userOffice) {
        setErrorMessage('User office could not be determined.');
        return;
      }

      if (!selectedCategory) {
        setErrorMessage('Please select or create a category.');
        return;
      }

      const formData = new FormData();
      
      // Add file or URL
      if (files.length > 0) {
        formData.append('file', files[0]); 
      }
      
      formData.append('name', fileName || fileUrl);
      formData.append('office', userOffice); 
      formData.append('category', selectedCategory);
      
      // Add URL if provided
      if (fileUrl.trim()) {
        formData.append('url', fileUrl.trim());
      }

      try {
        const token = localStorage.getItem('token');

        const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        setSuccessMessage("File or URL sent for approval");
        
        setTimeout(() => {
          setSuccessMessage("");
          setErrorMessage("");
        }, 3000);

        // Reset all fields
        setFileName('');
        setFileUrl('');
        setFiles([]);
        setSelectedCategory('');
      } catch (error) {
        console.error('Error uploading file/URL:', error);
        
        const errorMsg = error.response?.data?.error || 'Failed to upload file/URL';
        setErrorMessage(errorMsg);

        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    },
    [files, fileName, fileUrl, userOffice, selectedCategory]
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
            <label className="file-name-label">File/Resource Name:</label>
            <input
              type="text"
              className="file-name-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file or resource name"
            />

            {/* URL Input */}
            <label className="file-url-label">URL (Optional):</label>
            <input
              type="url"
              className="file-url-input"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="Enter URL of the resource"
            />

            {/* Office Display */}
            <div className="office-display">
              <label>Office: {userOffice}</label>
            </div>

            {/* Category Selection */}
            <div className="category-section">
              <label>Select Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">-- Select Category --</option>
                {existingCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* New Category Input */}
            <div className="new-category-section">
              <label>Add New Category:</label>
              <div className="new-category-input-group">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                  className="new-category-input"
                />
                <button 
                  type="button"
                  onClick={handleAddNewCategory}
                  className="add-category-btn"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              SUBMIT FOR APPROVAL
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