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
                <div className={`${darkMode ? 'dark-mode' : ''}`}>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/IIITH" target="_blank" rel="noreferrer" className="social-icon">
                            <img src={facebookIcon} alt="Facebook" />
                        </a>
                        <a href="https://www.instagram.com/iiit.hyderabad/" target="_blank" rel="noreferrer" className="social-icon">
                            <img src={instagramIcon} alt="Instagram" />
                        </a>
                        <a href="https://www.google.com/maps/place/Lalitha+Tiffins+and+Meals/@17.4456623,78.3519983,6a,58.9y/data=!3m8!1e2!3m6!1sAF1QipPxyjWBMhNAJjJjVVu2SNMA3Zsnr64jfVv6yjIV!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fp%2FAF1QipPxyjWBMhNAJjJjVVu2SNMA3Zsnr64jfVv6yjIV%3Dw203-h152-k-no!7i1280!8i960!4m7!3m6!1s0x3bcb93afdf07e57d:0x3da124e9d8d09a33!8m2!3d17.4455036!4d78.3518112!10e5!16s%2Fg%2F11tt5p7_mh?entry=ttu&g_ep=EgoyMDI1MDQxNi4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="social-icon">
                            <img src={googleIcon} alt="Google" />
                        </a>
                        <a href="https://www.linkedin.com/school/iiithofficial" target="_blank" rel="noreferrer" className="social-icon">
                            <img src={linkedinIcon} alt="LinkedIn" />
                        </a>
                        <a href="https://www.youtube.com/@iiithyderabad8947" target="_blank" rel="noreferrer" className="social-icon">
                            <img src={youtubeIcon} alt="YouTube" />
                        </a>
                    </div>
                    <p className="copyright">Copyright © 2025 IIIT-Hyderabad. All rights reserved.</p>
                    <p className="copyright">Made by <a href='https://www.github.com/AlooKaLaddoo' target='_blank'>Aviral</a>, <a href='https://www.github.com/Jam-shop' target='_blank'>Nilanjana</a>, <a href='https://www.github.com/shravanikalmali' target='_blank'>Shravani</a> and <a href='https://www.github.com/SiddharthMago' target='_blank'>Siddharth</a> :D</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
