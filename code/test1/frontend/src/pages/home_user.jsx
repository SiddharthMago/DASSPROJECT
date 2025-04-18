import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/home.css'; // We'll create this file for styling

// Import office section logos
import academicsLogo from '../assets/academics-logo.png';
import studentsLogo from '../assets/students-logo.png';
import researchLogo from '../assets/research-logo.png';
import adminLogo from '../assets/admin-logo.png';

// Home component - Main landing page for IIIT-Hyderabad website
function HomeUser({ darkMode }) {
  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);
  
  // State for quick links
  const [quickLinks, setQuickLinks] = useState([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(true);
  const [quickLinksError, setQuickLinksError] = useState(null);
  
  // State for portals
  const [portals, setPortals] = useState([]);
  const [portalsLoading, setPortalsLoading] = useState(true);
  const [portalsError, setPortalsError] = useState(null);
  
  // State for tracking current announcement index
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // Map office names to their respective logos
  const officeLogos = {
    'academics': academicsLogo,
    'students': studentsLogo,
    'research': researchLogo,
    'administration': adminLogo,
  };

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        console.log('Fetching announcements...');
        const response = await fetch('/api/announcements/latest');
        
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(`Failed to fetch announcements: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched announcements:', data);
        
        // Transform the data to match your component's expected format
        const formattedAnnouncements = data.data.map(announcement => ({
          text: announcement.title,
          office: announcement.office.toLowerCase(), // Convert to lowercase for consistency
          imageUrl: announcement.image,
          link: announcement.link
        }));
        
        console.log('Formatted announcements:', formattedAnnouncements);
        setAnnouncements(formattedAnnouncements);
        setAnnouncementsLoading(false);
      } catch (err) {
        console.error('Error details:', err);
        setAnnouncementsError(`Failed to load announcements: ${err.message}`);
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch quick links from backend
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        setQuickLinksLoading(true);
        console.log('Fetching quick links...');
        // First try to get pinned quick links
        const response = await fetch('/api/quicklinks/pinned');
        
        console.log('Quick links response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(`Failed to fetch quick links: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched quick links:', data);
        
        // If there are enough pinned quick links, use those
        if (data.data && data.data.length >= 6) {
          setQuickLinks(data.data);
        } else {
          // Otherwise, get all approved quick links
          const allLinksResponse = await fetch('/api/quicklinks');
          
          if (!allLinksResponse.ok) {
            throw new Error(`Failed to fetch all quick links: ${allLinksResponse.status}`);
          }
          
          const allLinksData = await allLinksResponse.json();
          console.log('Fetched all quick links:', allLinksData);
          
          setQuickLinks(allLinksData.data);
        }
        
        setQuickLinksLoading(false);
      } catch (err) {
        console.error('Error fetching quick links:', err);
        setQuickLinksError(`Failed to load quick links: ${err.message}`);
        setQuickLinksLoading(false);
        
        // Fallback to hardcoded quick links if fetch fails
        setQuickLinks([
          { title: "Academic Calendar", url: "/academic-calendar" },
          { title: "Admissions", url: "/admissions" },
          { title: "Research Publications", url: "/research-publications" },
          { title: "Faculty Directory", url: "/faculty" },
          { title: "Scholarships", url: "/scholarships" },
          { title: "Campus Map", url: "/campus-map" },
          { title: "Careers", url: "/careers" },
          { title: "News & Events", url: "/news" },
          { title: "Library Resources", url: "/library" },
          { title: "IT Services", url: "/it-services" },
          { title: "Student Clubs", url: "/student-clubs" },
          { title: "Hostel Information", url: "/hostel" },
          { title: "Sports Facilities", url: "/sports" },
          { title: "International Collaborations", url: "/collaborations" },
          { title: "Alumni Network", url: "/alumni" },
          { title: "Entrepreneurship Cell", url: "/ecell" },
          { title: "Grievance Portal", url: "/grievance" },
          { title: "Tenders & Notices", url: "/tenders" },
          { title: "Contact Us", url: "/contact" },
          { title: "Download Forms", url: "/forms" }
        ]);
      }
    };

    fetchQuickLinks();
  }, []);

  // Fetch portals from backend
  useEffect(() => {
    const fetchPortals = async () => {
      try {
        setPortalsLoading(true);
        console.log('Fetching portals...');
        // First try to get pinned portals
        const response = await fetch('/api/portals/pinned');
        
        console.log('Portals response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(`Failed to fetch portals: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched portals:', data);
        
        // If there are enough pinned portals, use those
        if (data.data && data.data.length >= 4) {
          setPortals(data.data);
        } else {
          // Otherwise, get all approved portals
          const allPortalsResponse = await fetch('/api/portals');
          
          if (!allPortalsResponse.ok) {
            throw new Error(`Failed to fetch all portals: ${allPortalsResponse.status}`);
          }
          
          const allPortalsData = await allPortalsResponse.json();
          console.log('Fetched all portals:', allPortalsData);
          
          setPortals(allPortalsData.data);
        }
        
        setPortalsLoading(false);
      } catch (err) {
        console.error('Error fetching portals:', err);
        setPortalsError(`Failed to load portals: ${err.message}`);
        setPortalsLoading(false);
        
        // Fallback to hardcoded portals if fetch fails
        setPortals([
          { title: "Old Intranet Portal", url: "http://oldintranet.iiit.ac.in", icon: "🔗" },
          { title: "IMS Portal", url: "https://ims.iiit.ac.in", icon: "🔗" },
          { title: "Help Portal", url: "https://help.iiit.ac.in", icon: "🔗" },
          { title: "Telephone Directory", url: "/portals/telephone", icon: "🔗" },
          { title: "College Portal", url: "https://iiit.ac.in", icon: "🔗" },
          { title: "Courses Portal", url: "https://courses.iiit.ac.in", icon: "🔗" }
        ]);
      }
    };

    fetchPortals();
  }, []);

  // Effect for rotating through announcements automatically
  useEffect(() => {
    if (announcements.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) =>
        (prevIndex + 1) % announcements.length
      );
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [announcements]);

  // Handle announcement click
  const handleAnnouncementClick = () => {
    if (announcements.length > 0 && announcements[currentAnnouncementIndex].link) {
      window.open(announcements[currentAnnouncementIndex].link, '_blank', 'noopener,noreferrer');
    }
  };

  // Function to get the appropriate background for the announcement
  const getAnnouncementBackground = (announcement) => {
    // If there's a valid imageUrl, use it
    if (announcement.imageUrl && !announcement.imageUrl.includes('undefined')) {
      const baseUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5000'; // Use Vite's environment variable or fallback to localhost
      const fullImageUrl = announcement.imageUrl.startsWith('http')
        ? announcement.imageUrl // If it's already a full URL, use it as is
        : `${baseUrl}${announcement.imageUrl}`; // Prepend the base URL for relative paths
  
      console.log('Using image URL:', fullImageUrl);
      return {
        backgroundImage: `url(${fullImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
  
    // Otherwise, use the office logo
    const officeName = announcement.office;
    const logoUrl = officeLogos[officeName];
  
    if (logoUrl) {
      console.log('Using office logo for', officeName, logoUrl);
      return {
        backgroundImage: `url(${logoUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
  
    // Fallback - use a class-based background
    console.log('Using class-based background for', officeName);
    return {};
  };
  
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);
  
  // Function to handle external links
  const getUrlTarget = (url) => {
    // Check if url is external (starts with http or https)
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return '_blank';
    }
    return '_self'; // Internal link
  };
  
  // Function to render the appropriate link component
  const renderLinkComponent = (item, index, className) => {
    const isExternalLink = item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'));
    
    if (isExternalLink) {
      return (
        <a 
          key={index} 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={className}
        >
          {item.icon && <div className="portal-icon">{item.icon}</div>}
          <span className="portal-title">{item.title}</span>
        </a>
      );
    } else {
      return (
        <Link key={index} to={item.url} className={className}>
          {item.icon && <div className="portal-icon">{item.icon}</div>}
          <span className="portal-title">{item.title}</span>
        </Link>
      );
    }
  };
  
  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
      />
      {/* Announcements Section */}
      <div className="announcements-section" id="announcements">
        {announcementsLoading ? (
          <div className="announcement-loading">Loading announcements...</div>
        ) : announcementsError ? (
          <div className="announcement-error">{announcementsError}</div>
        ) : announcements.length > 0 ? (
          <div
            className={`announcement-container ${announcements[currentAnnouncementIndex].office}`}
            style={{
              ...getAnnouncementBackground(announcements[currentAnnouncementIndex]),
              cursor: announcements[currentAnnouncementIndex].link ? 'pointer' : 'default'
            }}
            onClick={handleAnnouncementClick}
          >
            <div className="announcement-content">
              <span className={`office-tag ${announcements[currentAnnouncementIndex].office}`}>
                {announcements[currentAnnouncementIndex].office}
              </span>
              <p className="announcement-text">{announcements[currentAnnouncementIndex].text}</p>
            </div>
            <div className="announcement-dots">
              {announcements.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentAnnouncementIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent div click
                    setCurrentAnnouncementIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-announcements">No announcements available</div>
        )}
      </div>

      {/* Offices Section */}
      <div className="offices-section" id="offices">
        <h2 className="section-title">Offices</h2>

        <div className="offices-grid">
          {/* Academics Block */}
          <div className="office-block academics">
            <div className="office-header">
              <img
                src={academicsLogo}
                alt="Academics"
                className={`office-logo ${darkMode ? 'invert' : ''}`}
              />
              <h3>Academics</h3>
            </div>
            <div className="office-links-grid">
              <Link to="/user/offices/Admissions Office">Admissions Office</Link>
              <Link to="/user/offices/Library Office">Library Office</Link>
              <Link to="/user/offices/Examinations Office">Examinations Office</Link>
              <Link to="/user/offices/Academic Office">Academic Office</Link>
            </div>
          </div>

          {/* Students Block */}
          <div className="office-block students">
            <div className="office-header">
              <img
                src={studentsLogo}
                alt="Students"
                className={`office-logo ${darkMode ? 'invert' : ''}`}
              />
              <h3>Students</h3>
            </div>
            <div className="office-links-grid">
              <Link to="/user/offices/Student Affairs Office">Student Affairs Office</Link>
              <Link to="/user/offices/Mess Office">Mess Office</Link>
              <Link to="/user/offices/Hostel Office">Hostel Office</Link>
              <Link to="/user/offices/Alumni Cell">Alumni Cell</Link>
            </div>
          </div>

          {/* Research Block */}
          <div className="office-block research">
            <div className="office-header">
              <img
                src={researchLogo}
                alt="Research"
                className={`office-logo ${darkMode ? 'invert' : ''}`}
              />
              <h3>Research</h3>
            </div>
            <div className="office-links-grid">
              <Link to="/user/offices/Faculty Portal">Faculty Portal</Link>
              <Link to="/user/offices/Placement Cell">Placement Cell</Link>
              <Link to="/user/offices/Outreach Office">Outreach Office</Link>
              <Link to="/user/offices/Statistical Cell">Statistical Cell</Link>
              <Link to="/user/offices/R&D Office">R&D Office</Link>
            </div>
          </div>

          {/* Administration Block */}
          <div className="office-block administration">
            <div className="office-header">
              <img
                src={adminLogo}
                alt="Administration"
                className={`office-logo ${darkMode ? 'invert' : ''}`}
              />
              <h3>Administration</h3>
            </div>
            <div className="office-links-grid">
              <Link to="/user/offices/General Administration">General Administration</Link>
              <Link to="/user/offices/Accounts Office">Accounts Office</Link>
              <Link to="/user/offices/IT Services Office">IT Services Office</Link>
              <Link to="/user/offices/Communication Office">Communication Office</Link>
              <Link to="/user/offices/Engineering Office">Engineering Office</Link>
              <Link to="/user/offices/HR & Personnel">HR & Personnel</Link>
            </div>
          </div>
        </div>
      </div>

      {/* IIIT Portals Section - Now with database integration */}
      <div className="iiit-portals-section">
        <div className="iiit-portals-container">
          <h2 className="section-title">IIIT Portals</h2>
          
          {portalsLoading ? (
            <div className="portals-loading">Loading portals...</div>
          ) : portalsError ? (
            <div className="portals-error">{portalsError}</div>
          ) : portals.length > 0 ? (
            <div className="iiit-portals-grid">
              {portals.map((portal, index) => 
                renderLinkComponent(portal, index, "portal-link")
              )}
            </div>
          ) : (
            <div className="no-portals">No portals available</div>
          )}
        </div>
      </div>

      {/* Quick Links Section - Now with database integration */}
      <div className="quick-links-section" id="quick-links">
        <div className="quick-links-container">
          <h2 className="section-title">Quick Links</h2>
          
          {quickLinksLoading ? (
            <div className="quick-links-loading">Loading quick links...</div>
          ) : quickLinksError ? (
            <div className="quick-links-error">{quickLinksError}</div>
          ) : quickLinks.length > 0 ? (
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => 
                renderLinkComponent(link, index, "quick-link")
              )}
            </div>
          ) : (
            <div className="no-quick-links">No quick links available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeUser;