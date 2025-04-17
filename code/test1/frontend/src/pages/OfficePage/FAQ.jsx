"use client";
import React, { useState } from "react";

const FAQ = ({ darkMode, faqs }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // If no FAQs, show a message
  if (!faqs || faqs.length === 0) {
    return (
      <div className="faq-container">
        <p>No FAQs available for this office.</p>
      </div>
    );
  }

  return (
    <div className="faq-container">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className={`faq-item ${activeIndex === index ? 'active' : ''}`}
        >
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;