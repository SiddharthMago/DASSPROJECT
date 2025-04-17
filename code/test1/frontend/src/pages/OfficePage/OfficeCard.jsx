"use client";
import React from "react";

const AdmissionCard = ({ iconSrc, title, darkMode }) => {
  return (
    <div className="admission-card">
      <img 
        src={iconSrc} 
        alt="" 
        className={`card-icon ${darkMode ? 'invert' : ''}`} 
      />
      <div className="card-title">
        {title.includes("\n")
          ? title.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {index > 0 && <br />}
                <span>{line}</span>
              </React.Fragment>
            ))
          : title}
      </div>
    </div>
  );
};

export default AdmissionCard;