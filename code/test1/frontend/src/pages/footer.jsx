import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css';

import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import googleIcon from '../assets/google.png';
import linkedinIcon from '../assets/linkedin.png';
import youtubeIcon from '../assets/youtube.png';

function Footer({ darkMode }) {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="social-icons">
                    <a href="https://www.facebook.com/IIITH" target="_blank" rel="noreferrer" className="social-icon">
                        <img src={facebookIcon} alt="Facebook" />
                    </a>
                    <a href="https://www.instagram.com/iiith_official" target="_blank" rel="noreferrer" className="social-icon">
                        <img src={instagramIcon} alt="Instagram" />
                    </a>
                    <a href="https://www.google.com/maps/place/IIIT+Hyderabad" target="_blank" rel="noreferrer" className="social-icon">
                        <img src={googleIcon} alt="Google" />
                    </a>
                    <a href="https://www.linkedin.com/school/iiit-hyderabad" target="_blank" rel="noreferrer" className="social-icon">
                        <img src={linkedinIcon} alt="LinkedIn" />
                    </a>
                    <a href="https://www.youtube.com/channel/UCJt2yA0WRVVr9ESJ8EE_4Zw" target="_blank" rel="noreferrer" className="social-icon">
                        <img src={youtubeIcon} alt="YouTube" />
                    </a>
                </div>
                <p className="copyright">© 2025 IIIT-Hyderabad. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
