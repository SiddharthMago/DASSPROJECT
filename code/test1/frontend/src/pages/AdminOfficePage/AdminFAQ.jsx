"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';

const FAQ = ({ isAdmin = false, darkMode, faqs: initialFaqs = [], officeName, canEdit = false }) => {
  const [faqData, setFaqData] = useState(initialFaqs);

  // State for active FAQ item
  const [activeIndex, setActiveIndex] = useState(null);
  // State for editing
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  // State for similar FAQs
  const [similarFaqs, setSimilarFaqs] = useState([]);
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);

  // Load FAQs from localStorage on component mount
  useEffect(() => {
    const savedFaqs = localStorage.getItem('faqs');
    if (savedFaqs) {
      try {
        setFaqData(JSON.parse(savedFaqs));
      } catch (e) {
        console.error("Error loading FAQs from localStorage:", e);
      }
    }
  }, []);

  // Save FAQs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('faqs', JSON.stringify(faqData));
  }, [faqData]);

  // Clear similar FAQs when new FAQ form is hidden
  useEffect(() => {
    if (!showAddForm) {
      setSimilarFaqs([]);
    }
  }, [showAddForm]);

  const toggleFAQ = (index) => {
    if (isEditing !== null) return; // Don't toggle while editing
    setActiveIndex(activeIndex === index ? null : index);
  };

  const startEditing = (index) => {
    setIsEditing(index);
    setEditForm({
      question: faqData[index].question,
      answer: faqData[index].answer
    });
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditForm({ question: "", answer: "" });
  };

  const searchSimilarFaqs = async () => {
    if (newFaq.question.trim() === "") {
      return;
    }

    setIsSearchingSimilar(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/faqs/search-similar', {
        question: newFaq.question,
        office: officeName
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSimilarFaqs(response.data.data);
    } catch (error) {
      console.error('Error searching similar FAQs:', error);
    } finally {
      setIsSearchingSimilar(false);
    }
  };

  // Debounce function to limit API calls while typing
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (showAddForm && newFaq.question.trim().length > 5) {
        searchSimilarFaqs();
      }
    }, 500); // Wait for 500ms after typing stops

    return () => clearTimeout(debounceTimeout);
  }, [newFaq.question, showAddForm]);

  const addNewFaq = async () => {
    if (newFaq.question.trim() === "" || newFaq.answer.trim() === "") {
      alert("Question and answer cannot be empty");
      return;
    }

    const existingIndex = faqData.findIndex(
      (faq) => faq.question.trim().toLowerCase() === newFaq.question.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`/api/offices/faqs/${faqData[existingIndex]._id}`,
          { question: newFaq.question, answer: newFaq.answer },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

        const updatedFaqs = [...faqData];
        updatedFaqs[existingIndex] = response.data.data;
        setFaqData(updatedFaqs);
        setNewFaq({ question: "", answer: "" });
        setSimilarFaqs([]); // Clear similar FAQs
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding FAQ:', error);
        alert('Failed to add FAQ');
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/offices/faqs', {
        ...newFaq,
        office: officeName
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFaqData([...faqData, response.data.data]);
      setNewFaq({ question: "", answer: "" });
      setSimilarFaqs([]);
      setShowAddForm(false);
    }
    catch (err) {
      console.error("Error adding FAQ: ", err);
      alert("Failed to add FAQ");
    }
  };

  const saveFaq = async () => {
    if (editForm.question.trim() === "" || editForm.answer.trim() === "") {
      alert("Question and answer cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const faqToUpdate = faqData[isEditing];
      const response = await axios.put(`/api/offices/faqs/${faqToUpdate._id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const updatedFaqs = [...faqData];
      updatedFaqs[isEditing] = response.data.data;

      setFaqData(updatedFaqs);
      setIsEditing(null);
      setEditForm({ question: "", answer: "" });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('Failed to update FAQ');
    }
  };

  const deleteFaq = async (index) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        const token = localStorage.getItem('token');
        const faqToDelete = faqData[index];
        await axios.delete(`/api/offices/faqs/${faqToDelete._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const updatedFaqs = faqData.filter((_, i) => i !== index);
        setFaqData(updatedFaqs);

        if (activeIndex === index) {
          setActiveIndex(null);
        } else if (activeIndex > index) {
          setActiveIndex(activeIndex - 1);
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleNewFaqChange = (e) => {
    const { name, value } = e.target;
    setNewFaq(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const useSimilarFaq = (similarFaq) => {
    setNewFaq({
      question: similarFaq.question,
      answer: similarFaq.answer
    });
    setSimilarFaqs([]); // Clear similar FAQs list after selection
  };

  return (
    <div className="faq-container">
      {/* Only show add button if user can edit */}
      {isAdmin && canEdit && (
        <div className="admin-controls">
          <button
            className="admin-button add-button"
            onClick={() => setShowAddForm(true)}
          >
            Add New FAQ
          </button>
        </div>
      )}

      {/* Add New FAQ Form */}
      {isAdmin && showAddForm && (
        <div className="faq-form add-form">
          <h3>Add New FAQ</h3>
          <div className="form-group">
            <label htmlFor="newQuestion">Question:</label>
            <input
              type="text"
              id="newQuestion"
              name="question"
              value={newFaq.question}
              onChange={handleNewFaqChange}
              placeholder="Enter new question"
            />
          </div>

          {/* Similar FAQs section */}
          {newFaq.question.trim().length > 0 && (
            <div className="similar-faqs-container">
              <h4>Similar FAQs {isSearchingSimilar && <span className="searching">Searching...</span>}</h4>
              {similarFaqs.length > 0 ? (
                <div className="similar-faqs-list">
                  {similarFaqs.map((faq, idx) => (
                    <div key={idx} className="similar-faq-item">
                      <p className="similar-faq-question">{faq.question}</p>
                      <div className="similar-faq-buttons">
                        <button onClick={() => useSimilarFaq(faq)}>Use This FAQ</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !isSearchingSimilar && newFaq.question.trim().length > 5 &&
                <p className="no-similar">No similar FAQs found.</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newAnswer">Answer:</label>
            <textarea
              id="newAnswer"
              name="answer"
              value={newFaq.answer}
              onChange={handleNewFaqChange}
              placeholder="Enter the answer"
              rows="4"
            ></textarea>
          </div>
          <div className="form-buttons">
            <button className="save-button" onClick={addNewFaq}>Save</button>
            <button className="cancel-button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {faqData.map((faq, index) => (
        <div
          key={index}
          className={`faq-item ${activeIndex === index ? 'active' : ''} ${isEditing === index ? 'editing' : ''}`}
        >
          {isEditing === index ? (
            <div className="faq-form edit-form">
              <div className="form-group">
                <label htmlFor={`editQuestion${index}`}>Question:</label>
                <input
                  type="text"
                  id={`editQuestion${index}`}
                  name="question"
                  value={editForm.question}
                  onChange={handleEditFormChange}
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor={`editAnswer${index}`}>Answer:</label>
                <textarea
                  id={`editAnswer${index}`}
                  name="answer"
                  value={editForm.answer}
                  onChange={handleEditFormChange}
                  rows="4"
                ></textarea>
              </div>
              <div className="form-buttons">
                <button className="save-button" onClick={saveFaq}>Save</button>
                <button className="cancel-button" onClick={cancelEditing}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                {faq.question}
                <span className="faq-icon">
                  {activeIndex === index ? '−' : '+'}
                </span>
              </button>
              <div
                className={`faq-answer ${activeIndex === index ? 'show' : ''}`}
              >
                <p>{faq.answer}</p>
                {isAdmin && canEdit && activeIndex === index && (
                  <div className="admin-faq-controls">
                    <button
                      className="admin-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(index);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn faq-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFaq(index);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Admin-specific styles that complement the existing office.css */}
      <style jsx>{`
        .admin-controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        
        .admin-button {
          padding: 10px 20px;
          border-radius: 30px;
          border: none;
          font-family: "Barlow", sans-serif;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          letter-spacing: 1px;
          transition: all 0.2s ease;
          background-color: var(--office-title-bg);
          color: var(--text-primary);
        }
        
        .admin-button:hover {
          opacity: 0.9;
        }
        
        .admin-faq-controls {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .admin-btn {
          padding: 8px 15px;
          border-radius: 5px;
          border: none;
          font-family: "Barlow", sans-serif;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        
        .edit-btn {
          background-color: var(--office-title-bg);
          color: var(--text-primary);
        }
        
        .edit-btn:hover {
          opacity: 0.9;
        }
        
        .faq-delete-btn {
          background-color: #FF5A79;
          color: white;
        }
        
        .faq-delete-btn:hover {
          opacity: 0.9;
        }
        
        /* Form Styling */
        .faq-form {
          padding: 20px;
          background-color: var(--office-faq-bg);
          border-radius: 15px;
          margin-bottom: 20px;
        }
        
        .faq-form h3 {
          color: var(--office-text);
          margin-top: 0;
          margin-bottom: 15px;
          font-family: "Barlow", sans-serif;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--office-text);
          font-family: "Barlow", sans-serif;
        }
        
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--office-text);
          font-family: "Barlow", sans-serif;
          font-size: 16px;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .form-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .save-button, .cancel-button {
          padding: 8px 15px;
          border-radius: 5px;
          border: none;
          font-family: "Barlow", sans-serif;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        
        .save-button {
          background-color: var(--office-title-bg);
          color: white;
        }
        
        .save-button:hover {
          opacity: 0.9;
        }
        
        .cancel-button {
          background-color: #7f8c8d;
          color: white;
        }
        
        .cancel-button:hover {
          opacity: 0.9;
        }
        
        /* Similar FAQs styling */
        .similar-faqs-container {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 5px;
          background-color: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .similar-faqs-container h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--office-text);
          font-family: "Barlow", sans-serif;
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        
        .searching {
          font-size: 0.8em;
          margin-left: 10px;
          color: rgba(255, 255, 255, 0.7);
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        
        .similar-faqs-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .similar-faq-item {
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .similar-faq-question {
          margin: 0 0 5px 0;
          color: var(--office-text);
          font-family: "Barlow", sans-serif;
          font-weight: 600;
        }
        
        .similarity-score {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 5px 0;
        }
        
        .similar-faq-buttons {
          display: flex;
          justify-content: flex-end;
        }
        
        .similar-faq-buttons button {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          background-color: var(--office-title-bg);
          color: white;
          font-family: "Barlow", sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .similar-faq-buttons button:hover {
          opacity: 0.9;
        }
        
        .no-similar {
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          text-align: center;
        }
        
        /* Responsive Styling */
        @media (max-width: 768px) {
          .admin-controls {
            flex-direction: column;
            gap: 10px;
          }
          
          .admin-button, .admin-btn {
            width: 100%;
          }
          
          .form-buttons {
            flex-direction: column;
          }
          
          .save-button, .cancel-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;