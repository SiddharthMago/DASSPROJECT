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

  const addNewFaq = async () => {
    if (newFaq.question.trim() === "" || newFaq.answer.trim() === "") {
      alert("Question and answer cannot be empty");
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

      // Add the new FAQ returned from the server
      setFaqData([...faqData, response.data.data]);
      setNewFaq({ question: "", answer: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding FAQ:', error);
      alert('Failed to add FAQ');
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
          color: white;
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
          color: white;
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
        
        /* Responsive Styling */
        @media (max-width: 768px) {
          .admin-controls {
            flex-direction: column;
            gap: 10px;
          }
          
          .admin-button, .admin-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;