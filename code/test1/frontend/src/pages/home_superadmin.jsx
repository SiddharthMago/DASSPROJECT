import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/home.css'; // We'll create this file for styling

// Import office section logos
import academicsLogo from '../assets/academics-logo.png';
import studentsLogo from '../assets/students-logo.png';
import researchLogo from '../assets/research-logo.png';
import adminLogo from '../assets/admin-logo.png';

import editIcon from '../assets/edit-icon.jpg';
import addIcon from '../assets/add-icon.jpg';
import deleteIcon from '../assets/delete-icon.jpg';

// Home component - Admin landing page for IIIT-Hyderabad website
function HomeAdmin({ darkMode }) {
  // State for announcements
  const [authToken, setAuthToken] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  // State for quick links
  const [quickLinks, setQuickLinks] = useState([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(true);
  const [quickLinksError, setQuickLinksError] = useState(null);
  const [editQuickLinkOffice, setEditQuickLinkOffice] = useState("None");


  // State for portals
  const [portals, setPortals] = useState([]);
  const [portalsLoading, setPortalsLoading] = useState(true);
  const [portalsError, setPortalsError] = useState(null);
  const [editPortalOffice, setEditPortalOffice] = useState("");

  // State for tracking current announcement index
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // State for announcement editing
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editOffice, setEditOffice] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);

  // State for adding new announcement
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [newAnnouncementOffice, setNewAnnouncementOffice] = useState("None");
  const [newAnnouncementLink, setNewAnnouncementLink] = useState("");
  const [newAnnouncementImage, setNewAnnouncementImage] = useState(null);
  const [newAnnouncementImageUrl, setNewAnnouncementImageUrl] = useState(null);

  // Quick links editing state
  const [isEditingQuickLinks, setIsEditingQuickLinks] = useState(false);
  const [selectedQuickLinkIndex, setSelectedQuickLinkIndex] = useState(null);
  const [editQuickLinkTitle, setEditQuickLinkTitle] = useState("");
  const [editQuickLinkUrl, setEditQuickLinkUrl] = useState("");
  const [isAddingQuickLink, setIsAddingQuickLink] = useState(false);

  // Portals editing state
  const [isEditingPortals, setIsEditingPortals] = useState(false);
  const [selectedPortalIndex, setSelectedPortalIndex] = useState(null);
  const [editPortalTitle, setEditPortalTitle] = useState("");
  const [editPortalUrl, setEditPortalUrl] = useState("");
  const [editPortalIcon, setEditPortalIcon] = useState("🔗");
  const [isAddingPortal, setIsAddingPortal] = useState(false);

  // Map office names to their respective logos
  const officeLogos = {
    'academics': academicsLogo,
    'students': studentsLogo,
    'research': researchLogo,
    'administration': adminLogo,
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Auth token:', token);
    setAuthToken(token);
  }, []);

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
          office: announcement.office,
          imageUrl: announcement.image,
          link: announcement.link,
          id: announcement._id
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
  // Fetch pinned quick links from backend
useEffect(() => {
  const fetchQuickLinks = async () => {
    try {
      setQuickLinksLoading(true);
      console.log('Fetching pinned quick links...');
      const response = await fetch('/api/quicklinks');

      console.log('Quick links response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        throw new Error(`Failed to fetch quick links: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched pinned quick links:', data);
      setQuickLinks(data.data.filter(link => link.status === 'approved'));
      setQuickLinksLoading(false);
    } catch (err) {
      console.error('Error fetching quick links:', err);
      setQuickLinksError(`Failed to load quick links: ${err.message}`);
      setQuickLinksLoading(false);
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
        // For admin, fetch all portals regardless of pinned status
        const response = await fetch('/api/portals');

        console.log('Portals response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(`Failed to fetch portals: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched portals:', data);
        setPortals(data.data);
        setPortalsLoading(false);
      } catch (err) {
        console.error('Error fetching portals:', err);
        setPortalsError(`Failed to load portals: ${err.message}`);
        setPortalsLoading(false);
      }
    };

    fetchPortals();
  }, []);

  // Effect for rotating through announcements automatically
  useEffect(() => {
    if (announcements.length === 0 || isEditing) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) =>
        (prevIndex + 1) % announcements.length
      );
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [announcements, isEditing]);

  // Start editing announcement
  const startEditingAnnouncement = () => {
    if (announcements.length === 0) return;

    setIsEditing(true);
    const currentAnnouncement = announcements[currentAnnouncementIndex];
    setEditText(currentAnnouncement.text);
    setEditOffice(currentAnnouncement.office); // Set the office for the dropdown
    setEditImageUrl(currentAnnouncement.imageUrl);
    setEditLink(currentAnnouncement.link || '');
    setEditImage(null);
  };

  // Save edited announcement
  const saveAnnouncement = async () => {
    try {
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const currentAnnouncement = announcements[currentAnnouncementIndex];
      const id = currentAnnouncement.id;

      // Create FormData for the update
      const formData = new FormData();
      formData.append('title', editText);
      formData.append('office', editOffice); // Use the corrected office name
      formData.append('link', editLink || '');

      // If a new image was selected, append it
      if (editImage) {
        formData.append('image', editImage);
      }

      // Make API call to update the announcement
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update announcement');
      }

      // Update local state with our values
      const updatedAnnouncements = [...announcements];
      updatedAnnouncements[currentAnnouncementIndex] = {
        ...currentAnnouncement,
        text: editText,
        office: editOffice,
        link: editLink || '',
        imageUrl: responseData.data.image || currentAnnouncement.imageUrl,
        id: id
      };

      setAnnouncements(updatedAnnouncements);
      setIsEditing(false);

      setSuccessMessage("Announcement updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error updating announcement:', err);
      alert(`Failed to update announcement: ${err.message}`);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditImage(null);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImage(e.target.files[0]);
      setEditImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Remove current image
  const removeImage = () => {
    setEditImage(null);
    setEditImageUrl(null);
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

  // Function to start editing a quick link
  const startEditingQuickLink = (index) => {
    const quickLink = quickLinks[index];
    setSelectedQuickLinkIndex(index);
    setEditQuickLinkTitle(quickLink.title);
    setEditQuickLinkUrl(quickLink.url);
    setEditQuickLinkOffice(quickLink.office || "Admissions Office");
    setIsEditingQuickLinks(true);
    setIsAddingQuickLink(false);
  };

  // Function to save edited quick link
  const saveQuickLink = async () => {
    if (selectedQuickLinkIndex === null) return;

    try {
      const quickLink = quickLinks[selectedQuickLinkIndex];

      // API call to update the quick link
      const response = await fetch(`/api/quicklinks/${quickLink._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: editQuickLinkTitle,
          url: editQuickLinkUrl,
          office: editQuickLinkOffice,
          status: 'pending',
        }),
      });

      if (!response.ok) throw new Error('Failed to update quick link');

      // Update local state
      const updatedQuickLinks = [...quickLinks];
      updatedQuickLinks[selectedQuickLinkIndex] = {
        ...quickLink,
        title: editQuickLinkTitle,
        url: editQuickLinkUrl,
        office: editQuickLinkOffice // Update office in local state
      };

      setQuickLinks(updatedQuickLinks);

      setSuccessMessage("Quick link updated successfully");

      // Automatically close the edit view
      setIsEditingQuickLinks(false);
      setSelectedQuickLinkIndex(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error updating quick link:', err);
      alert('Failed to update quick link. Please try again.');
    }
  };

  // Function to start adding a new quick link
  const startAddingQuickLink = () => {
    setIsAddingQuickLink(true);
    setEditQuickLinkTitle("");
    setEditQuickLinkUrl("");
    setSelectedQuickLinkIndex(null);
  };

  // Function to save new quick link
  const saveNewQuickLink = async () => {
    if (editQuickLinkTitle.trim() === "" || editQuickLinkUrl.trim() === "") {
      alert("Title and URL are required");
      return;
    }

    try {
      const response = await fetch('/api/quicklinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: editQuickLinkTitle.trim(),
          url: editQuickLinkUrl.trim(),
          office: editQuickLinkOffice, // Include the selected office
        })
      });

      const responseBody = await response.json();
      console.log('QuickLink Creation Response:', {
        status: response.status,
        body: responseBody
      });

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          return;
        }
        throw new Error(responseBody.error || 'Failed to create quick link');
      }

      // Show success message for approval process
      setSuccessMessage("Quick link sent for approval");

      // Reset form state
      setIsAddingQuickLink(false);
      setEditQuickLinkTitle("");
      setEditQuickLinkUrl("");
      setEditQuickLinkOffice("None");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refetch to get updated data
      const refreshResponse = await fetch('/api/quicklinks', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setQuickLinks(data.data.filter(link => link.status === 'approved'));
      }
    } catch (err) {
      console.error('Full Error in QuickLink Creation:', err);
      alert(`Failed to create quick link: ${err.message}`);
    }
  };

  // Function to cancel editing quick link
  const cancelEditingQuickLink = () => {
    setIsEditingQuickLinks(false);
    setIsAddingQuickLink(false);
    setSelectedQuickLinkIndex(null);
    setEditQuickLinkTitle("");
    setEditQuickLinkUrl("");
  };

  // Function to remove a quick link
  const removeQuickLink = async (index) => {
    const quickLink = quickLinks[index];

    if (window.confirm(`Are you sure you want to delete "${quickLink.title}"?`)) {
      try {
        // API call to delete the quick link
        const response = await fetch(`/api/quicklinks/${quickLink._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to delete quick link');

        // Update local state
        const updatedQuickLinks = quickLinks.filter((_, i) => i !== index);
        setQuickLinks(updatedQuickLinks);

        setSuccessMessage("Quick link deleted successfully");

        // Automatically close the edit view
        setIsEditingQuickLinks(false);
        setSelectedQuickLinkIndex(null);

        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error('Error deleting quick link:', err);
        alert('Failed to delete quick link. Please try again.');
      }
    }
  };

  // Function to toggle the pinned status of a quick link
  const toggleQuickLinkPin = async (index) => {
    const quickLink = quickLinks[index];
    const confirmMsg = quickLink.pinned
      ? `Are you sure you want to unpin "${quickLink.title}"?`
      : `Are you sure you want to pin "${quickLink.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // Use the correct endpoint based on the action
      const endpoint = quickLink.pinned ? 'unpin' : 'pin';
      const response = await fetch(`/api/quicklinks/${quickLink._id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to update pin status');

      // Update local state
      const updatedQuickLinks = quickLinks.map((link, i) =>
        i === index ? { ...link, pinned: !link.pinned } : link
      );

      // Only filter out unpinned links if we're not in editing mode
      if (!isEditingQuickLinks) {
        setQuickLinks(updatedQuickLinks.filter(link => link.status === 'approved'));
      } else {
        setQuickLinks(updatedQuickLinks);
      }

      const actionType = quickLink.pinned ? 'unpinned' : 'pinned';
      setSuccessMessage(`Quick link ${actionType} successfully`);

      // Automatically close the edit view
      setIsEditingQuickLinks(false);
      setSelectedQuickLinkIndex(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error toggling pin status:', err);
      alert('Failed to update pin status. Please try again.');
    }
  };


  // Portal functions
  const startEditingPortal = (index) => {
    const portal = portals[index];
    setSelectedPortalIndex(index);
    setEditPortalTitle(portal.title);
    setEditPortalUrl(portal.url);
    setEditPortalIcon(portal.icon || '🔗');
    setIsEditingPortals(true);
    setIsAddingPortal(false);
  };

  const savePortal = async () => {
    if (selectedPortalIndex === null) return;
  
    try {
      const portal = portals[selectedPortalIndex];
  
      // Make API call to update the portal
      const response = await fetch(`/api/portals/${portal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Add auth token
        },
        body: JSON.stringify({
          title: editPortalTitle,
          url: editPortalUrl,
          icon: editPortalIcon
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update portal');
      }
  
      // Update local state
      const updatedPortals = [...portals];
      updatedPortals[selectedPortalIndex] = {
        ...portal,
        title: editPortalTitle,
        url: editPortalUrl,
        icon: editPortalIcon
      };
  
      setPortals(updatedPortals);
      
      // Show success message
      setSuccessMessage("Portal updated successfully");
      
      // Close editing mode
      setIsEditingPortals(false);
      setSelectedPortalIndex(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
  
      // Refetch to get updated data
      const refreshResponse = await fetch('/api/portals');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setPortals(data.data);
      }
    } catch (err) {
      console.error('Error updating portal:', err);
      alert('Failed to update portal. Please try again.');
    }
  };

  const startAddingPortal = () => {
    setIsAddingPortal(true);
    setEditPortalTitle("");
    setEditPortalUrl("");
    setEditPortalIcon("🔗");
    setSelectedPortalIndex(null);
  };

  const saveNewPortal = async () => {
    if (editPortalTitle.trim() === "" || editPortalUrl.trim() === "") {
      alert("Title and URL are required");
      return;
    }
  
    try {
      // Make API call to create a new portal
      const response = await fetch('/api/portals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: editPortalTitle.trim(),
          url: editPortalUrl.trim(),
          icon: editPortalIcon,
          office: editPortalOffice,
          status: 'pending',
          pinned: false
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create portal');
      }
  
      // Show success message
      setSuccessMessage("Portal created successfully");
  
      // Reset form state and close editing mode
      setIsAddingPortal(false);
      setEditPortalTitle("");
      setEditPortalUrl("");
      setEditPortalIcon("🔗");
      setIsEditingPortals(false);
  
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
  
      // Refetch to get updated data
      const refreshResponse = await fetch('/api/portals');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setPortals(data.data);
      }
    } catch (err) {
      console.error('Error creating portal:', err);
      alert('Failed to create portal. Please try again.');
    }
  };

  const cancelEditingPortal = () => {
    setIsEditingPortals(false);
    setIsAddingPortal(false);
    setSelectedPortalIndex(null);
    setEditPortalTitle("");
    setEditPortalUrl("");
    setEditPortalIcon("🔗");
  };

  const removePortal = async (index) => {
    const portal = portals[index];
  
    if (window.confirm(`Are you sure you want to delete "${portal.title}"?`)) {
      try {
        // Make API call to delete the portal
        const response = await fetch(`/api/portals/${portal._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}` // Add auth token
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete portal');
        }
  
        // Update local state
        const updatedPortals = portals.filter((_, i) => i !== index);
        setPortals(updatedPortals);
        
        // Show success message
        setSuccessMessage("Portal deleted successfully");
        
        // Close editing mode
        setIsEditingPortals(false);
        setSelectedPortalIndex(null);
        
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error('Error deleting portal:', err);
        alert('Failed to delete portal. Please try again.');
      }
    }
  };

  const togglePortalPin = async (index) => {
    const portal = portals[index];
    const confirmMsg = portal.pinned
      ? `Are you sure you want to unpin "${portal.title}"?`
      : `Are you sure you want to pin "${portal.title}"?`;
  
    if (!window.confirm(confirmMsg)) return;
  
    try {
      const response = await fetch(`/api/portals/${portal._id}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to update pin status');
  
      const updatedPortals = [...portals];
      updatedPortals[index] = {
        ...portal,
        pinned: !portal.pinned
      };
      setPortals(updatedPortals);
  
      const actionType = portal.pinned ? 'unpinned' : 'pinned';
      setSuccessMessage(`Portal ${actionType} successfully`);
      
      // Close editing mode
      setIsEditingPortals(false);
      setSelectedPortalIndex(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error toggling pin status:', err);
      alert('Failed to update pin status. Please try again.');
    }
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

  // Function to render links with appropriate handling for external URLs
  const renderLinkComponent = (item, index, className, isEditing, onEdit, onPin, onDelete) => {
    const isExternalLink = item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'));

    if (isEditing) {
      return (
        <div key={index} className={`${className}-edit-wrapper`}>
          <div className={`${className}-info`}>
            <div className={`${className}-title`}>{item.title}</div>
            {item.author && (
              <div className={`${className}-author`}>
                Added by {item.author.name || item.author}
              </div>
            )}
            <div className={`${className}-status`}>
              Status: {item.status || 'Pending'}
            </div>
          </div>
          <div className={`${className}-actions`}>
            <button
              className="admin-edit-btn"
              onClick={() => onEdit(index)}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="admin-pin-btn"
              onClick={() => onPin(index)}
              title={item.pinned ? "Unpin" : "Pin"}
            >
              {item.pinned ? "📌" : "📍"}
            </button>
            <button
              className="admin-delete-btn"
              onClick={() => onDelete(index)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    } else if (isExternalLink) {
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

  // Function to delete an announcement
  const deleteAnnouncement = async (index) => {
    const announcement = announcements[index];

    if (window.confirm(`Are you sure you want to delete this announcement?`)) {
      try {
        const response = await fetch(`/api/announcements/${announcement.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete announcement');
        }

        // Update local state
        const updatedAnnouncements = announcements.filter((_, i) => i !== index);
        setAnnouncements(updatedAnnouncements);

        // Adjust current index if needed
        if (currentAnnouncementIndex >= updatedAnnouncements.length) {
          setCurrentAnnouncementIndex(Math.max(0, updatedAnnouncements.length - 1));
        }

        setSuccessMessage("Announcement deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error('Error deleting announcement:', err);
        alert('Failed to delete announcement. Please try again.');
      }
    }
  };

  // Function to add a new announcement
  const addNewAnnouncement = async () => {
    try {
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('title', newAnnouncementText);
      formData.append('office', newAnnouncementOffice);
      formData.append('link', newAnnouncementLink);
      formData.append('status', 'pending');
      if (newAnnouncementImage) {
        formData.append('image', newAnnouncementImage);
      }

      console.log('Sending announcement data:', {
        title: newAnnouncementText,
        office: newAnnouncementOffice,
        link: newAnnouncementLink,
        status: 'pending',
        hasImage: !!newAnnouncementImage
      });

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add announcement');
      }

      // Update local state
      const updatedAnnouncements = [...announcements, {
        text: responseData.data.title,
        office: responseData.data.office,
        link: responseData.data.link,
        imageUrl: responseData.data.image,
        id: responseData.data._id
      }];

      setAnnouncements(updatedAnnouncements);
      setIsAddingAnnouncement(false);
      setNewAnnouncementText("");
      setNewAnnouncementOffice("");
      setNewAnnouncementLink("");
      setNewAnnouncementImage(null);
      setNewAnnouncementImageUrl(null);

      setSuccessMessage("Announcement added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error adding announcement:', err);
      alert(`Failed to add announcement: ${err.message}`);
    }
  };

  // Function to handle new image upload
  const handleNewImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAnnouncementImage(e.target.files[0]);
      setNewAnnouncementImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Function to remove new image
  const removeNewImage = () => {
    setNewAnnouncementImage(null);
    setNewAnnouncementImageUrl(null);
  };

  const handleAnnouncementClick = (e) => {
    e.stopPropagation();
    const link = announcements[currentAnnouncementIndex].link;
    if (link) {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link;
      }
    }
  };

  const displayedQuickLinks = isEditingQuickLinks ? quickLinks : quickLinks.filter(link => link.pinned);

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
          isEditing ? (
            <div
              className={`announcement-container ${editOffice}`}
              style={editImageUrl ? { backgroundImage: `url(${editImageUrl})` } : {}}
            >
              <div className="announcement-edit-mode">
                <div className="edit-form-group">
                  <label htmlFor="office-select">Office:</label>
                  <select
                    id="office-select"
                    value={editOffice} // Bind to the editOffice state
                    onChange={(e) => setEditOffice(e.target.value)} // Update the state on change
                    className="office-select"
                  >
                    <option value="None">Select Office</option>
                    <option value="Admissions Office">Admissions Office</option>
                    <option value="Academic Office">Academic Office</option>
                    <option value="Library Office">Library Office</option>
                    <option value="Examinations Office">Examinations Office</option>
                    <option value="Student Affairs Office">Student Affairs Office</option>
                    <option value="Hostel Office">Hostel Office</option>
                    <option value="Mess Office">Mess Office</option>
                    <option value="Alumni Cell">Alumni Cell</option>
                    <option value="Faculty Portal">Faculty Portal</option>
                    <option value="Outreach Office">Outreach Office</option>
                    <option value="R&D Office">R&D Office</option>
                    <option value="Placement Cell">Placement Cell</option>
                    <option value="Statistical Cell">Statistical Cell</option>
                    <option value="General Administration">General Administration</option>
                    <option value="Accounts Office">Accounts Office</option>
                    <option value="IT Services Office">IT Service Offices</option>
                    <option value="Communication Office">Communication Office</option>
                    <option value="Engineering Office">Engineering Office</option>
                    <option value="HR & Personnel">HR & Personnel</option>
                  </select>
                </div>

                <div className="image-upload-container">
                  <label className="image-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                    />
                    <span>📷 {editImageUrl ? 'Change Banner Image' : 'Upload Custom Banner Image'}</span>
                  </label>

                  {editImageUrl && (
                    <div className="image-preview-container">
                      <img src={editImageUrl} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="image-upload-remove"
                        onClick={removeImage}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="edit-form-group">
                  <label htmlFor="announcement-text">Announcement Text:</label>
                  <textarea
                    id="announcement-text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="announcement-edit-textarea"
                    placeholder="Announcement text..."
                  />
                </div>

                <div className="edit-form-group">
                  <label htmlFor="announcement-link">Link (optional):</label>
                  <input
                    id="announcement-link"
                    type="text"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    className="announcement-edit-input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="edit-buttons">
                  <button onClick={saveAnnouncement} className="save-btn">Save</button>
                  <button onClick={cancelEditing} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          ) : isAddingAnnouncement ? (
            <div className="announcement-container">
              <div className="announcement-edit-mode">
                <h3>Add New Announcement</h3>
                <div className="edit-form-group">
                  <label htmlFor="new-office-select">Office:</label>
                  <select
                    id="new-office-select"
                    value={newAnnouncementOffice}
                    onChange={(e) => setNewAnnouncementOffice(e.target.value)}
                    className="office-select"
                  >
                    <option value="None">None</option>
                    <option value="Admissions Office">Admissions Office</option>
                    <option value="Academic Office">Academic Office</option>
                    <option value="Library Office">Library Office</option>
                    <option value="Examinations Office">Examinations Office</option>
                    <option value="Student Affairs Office">Student Affairs Office</option>
                    <option value="Hostel Office">Hostel Office</option>
                    <option value="Mess Office">Mess Office</option>
                    <option value="Alumni Cell">Alumni Cell</option>
                    <option value="Faculty Portal">Faculty Portal</option>
                    <option value="Outreach Office">Outreach Office</option>
                    <option value="R&D Office">R&D Office</option>
                    <option value="Placement Cell">Placement Cell</option>
                    <option value="Statistical Cell">Statistical Cell</option>
                    <option value="General Administration">General Administration</option>
                    <option value="Accounts Office">Accounts Office</option>
                    <option value="IT Services Office">IT Services Office</option>
                    <option value="Communications Office">Communications Office</option>
                    <option value="Engineering Office">Engineering Office</option>
                    <option value="HR & Personnel">HR & Personnel</option>
                  </select>
                </div>

                <div className="image-upload-container">
                  <label className="image-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewImageChange}
                      className="image-upload-input"
                    />
                    <span>📷 {newAnnouncementImageUrl ? 'Change Banner Image' : 'Upload Custom Banner Image'}</span>
                  </label>

                  {newAnnouncementImageUrl && (
                    <div className="image-preview-container">
                      <img src={newAnnouncementImageUrl} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="image-upload-remove"
                        onClick={removeNewImage}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="edit-form-group">
                  <label htmlFor="new-announcement-text">Announcement Text:</label>
                  <textarea
                    id="new-announcement-text"
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    className="announcement-edit-textarea"
                    placeholder="Announcement text..."
                  />
                </div>

                <div className="edit-form-group">
                  <label htmlFor="new-announcement-link">Link (optional):</label>
                  <input
                    id="new-announcement-link"
                    type="text"
                    value={newAnnouncementLink}
                    onChange={(e) => setNewAnnouncementLink(e.target.value)}
                    className="announcement-edit-input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="edit-buttons">
                  <button onClick={addNewAnnouncement} className="save-btn">Add</button>
                  <button onClick={() => setIsAddingAnnouncement(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`announcement-container ${announcements[currentAnnouncementIndex].office}`}
              style={{
                ...getAnnouncementBackground(announcements[currentAnnouncementIndex]),
                cursor: announcements[currentAnnouncementIndex].link ? 'pointer' : 'default'
              }}
              onClick={handleAnnouncementClick}
            >
              <div className="announcement-navigation">
                <button
                  className="prev-announcement-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    setCurrentAnnouncementIndex((prevIndex) =>
                      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
                    );
                  }}
                  aria-label="Previous Announcement"
                  title="Previous Announcement"
                >
                  ◀
                </button>
                <button
                  className="next-announcement-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    setCurrentAnnouncementIndex((prevIndex) =>
                      (prevIndex + 1) % announcements.length
                    );
                  }}
                  aria-label="Next Announcement"
                  title="Next Announcement"
                >
                  ▶
                </button>
              </div>
              <div className="announcement-content">
                <Link 
                  to={`/superadmin/offices/${announcements[currentAnnouncementIndex].office}`}
                  className={`office-tag ${announcements[currentAnnouncementIndex].office}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {announcements[currentAnnouncementIndex].office}
                </Link>
                <p className="announcement-text">{announcements[currentAnnouncementIndex].text}</p>
                {announcements[currentAnnouncementIndex].link && (
                  <div className="link-indicator">Click to read more</div>
                )}
              </div>
              <div className="announcement-actions">
                <button
                  className="edit-announcement-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    startEditingAnnouncement();
                  }}
                  aria-label="Edit announcement"
                  title="Edit announcement"
                >
                  <img src={editIcon} alt="Edit" className="action-icon" />
                </button>
                <button
                  className="add-announcement-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    setIsAddingAnnouncement(true);
                  }}
                  aria-label="Add new announcement"
                  title="Add new announcement"
                >
                  <img src={addIcon} alt="Add" className="action-icon" />
                </button>
                <button
                  className="delete-announcement-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    deleteAnnouncement(currentAnnouncementIndex);
                  }}
                  aria-label="Delete announcement"
                  title="Delete announcement"
                >
                  <img src={deleteIcon} alt="Delete" className="action-icon" />
                </button>
              </div>
              <div className="announcement-dots">
                {announcements.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentAnnouncementIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent container click
                      setCurrentAnnouncementIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="no-announcements">
            <p>No announcements available</p>
            <button
              className="add-announcement-btn"
              onClick={() => setIsAddingAnnouncement(true)}
            >
              + Add New Announcement
            </button>
          </div>
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
              <Link to="/superadmin/offices/Admissions Office">Admissions Office</Link>
              <Link to="/superadmin/offices/Library Office">Library Office</Link>
              <Link to="/superadmin/offices/Examinations Office">Examinations Office</Link>
              <Link to="/superadmin/offices/Academic Office">Academic Office</Link>
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
              <Link to="/superadmin/offices/Student Affairs Office">Student Affairs Office</Link>
              <Link to="/superadmin/offices/Mess Office">Mess Office</Link>
              <Link to="/superadmin/offices/Hostel Office">Hostel Office</Link>
              <Link to="/superadmin/offices/Alumni Cell">Alumni Cell</Link>
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
              <Link to="/superadmin/offices/Faculty Portal">Faculty Portal</Link>
              <Link to="/superadmin/offices/Placement Cell">Placement Cell</Link>
              <Link to="/superadmin/offices/Outreach Office">Outreach Office</Link>
              <Link to="/superadmin/offices/Statistical Cell">Statistical Cell</Link>
              <Link to="/superadmin/offices/R&D Office">R&D Office</Link>
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
              <Link to="/superadmin/offices/General Administration">General Administration</Link>
              <Link to="/superadmin/offices/Accounts Office">Accounts Office</Link>
              <Link to="/superadmin/offices/IT Services Office">IT Services Office</Link>
              <Link to="/superadmin/offices/Communication Office">Communication Office</Link>
              <Link to="/superadmin/offices/Engineering Office">Engineering Office</Link>
              <Link to="/superadmin/offices/HR & Personnel">HR & Personnel</Link>
            </div>
          </div>
        </div>
      </div>
      {successMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'fadeInOut 3s ease-in-out'
          }}
        >
          {successMessage}
        </div>
      )}
      {/* IIIT Portals Section - With editing capabilities */}
      <div className="iiit-portals-section">
        <div className="iiit-portals-container">
          <div className="section-header">
            <h2 className="section-title">IIIT Portals</h2>
            <button
              className="edit-section-btn"
              onClick={() => setIsEditingPortals(!isEditingPortals)}
              aria-label="Edit portals"
              title="Edit portals"
            >
              <img src={editIcon} alt="Edit" className="action-icon" />
            </button>
          </div>

          {isEditingPortals && !isAddingPortal && selectedPortalIndex === null && (
            <div className="portal-edit-panel">
              <div className="edit-actions">
                <button onClick={startAddingPortal} className="add-btn">
                  Add New Portal
                </button>
                {/* <button onClick={cancelEditingPortal} className="cancel-btn">
                  Done Editing
                </button> */}
              </div>
            </div>
          )}

          {isEditingPortals && isAddingPortal && (
            <div className="portal-edit-form">
              <h3>Add New Portal</h3>
              <div className="edit-form-group">
                <label htmlFor="portal-title">Title:</label>
                <input
                  id="portal-title"
                  type="text"
                  value={editPortalTitle}
                  onChange={(e) => setEditPortalTitle(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-url">URL:</label>
                <input
                  id="portal-url"
                  type="text"
                  value={editPortalUrl}
                  onChange={(e) => setEditPortalUrl(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-office">Office:</label>
                  <select
                    id="portal-office"
                    value={editPortalOffice}
                    onChange={e => setEditPortalOffice(e.target.value)}
                    className="office-select"
                  >
                      <option value="None">Select Office</option>
                      <option value="Admissions Office">Admissions Office</option>
                      <option value="Library Office">Library Office</option>
                      <option value="Examinations Office">Examinations Office</option>
                      <option value="Academic Office">Academic Office</option>
                      <option value="Student Affairs Office">Student Affairs Office</option>
                      <option value="Mess Office">Mess Office</option>
                      <option value="Hostel Office">Hostel Office</option>
                      <option value="Alumni Cell">Alumni Cell</option>
                      <option value="Faculty Portal">Faculty Portal</option>
                      <option value="Placement Cell">Placement Cell</option>
                      <option value="Outreach Office">Outreach Office</option>
                      <option value="Statistical Cell">Statistical Cell</option>
                      <option value="R&D Office">R&D Office</option>
                      <option value="General Administration">General Administration</option>
                      <option value="Accounts Office">Accounts Office</option>
                      <option value="IT Services Office">IT Services Office</option>
                      <option value="Communication Office">Communication Office</option>
                      <option value="Engineering Office">Engineering Office</option>
                      <option value="HR & Personnel">HR & Personnel</option>
                  </select>
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-icon">Icon:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Input field for custom icon */}
                  <input
                    id="portal-icon"
                    type="text"
                    value={editPortalIcon}
                    onChange={(e) => setEditPortalIcon(e.target.value)}
                    maxLength={2}
                    placeholder="Custom Icon"
                  />
                  {/* Dropdown for predefined icons */}
                  <select
                    value={editPortalIcon}
                    onChange={(e) => setEditPortalIcon(e.target.value)}
                    className="icon-dropdown"
                  >
                    <option value="🔗">🔗</option>
                    <option value="📁">📁</option>
                    <option value="🌐">🌐</option>
                    <option value="📄">📄</option>
                    <option value="⚙️">⚙️</option>
                  </select>
                </div>
              </div>
              <div className="edit-buttons">
                <button onClick={saveNewPortal} className="save-btn">Save</button>
                <button onClick={cancelEditingPortal} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          {isEditingPortals && selectedPortalIndex !== null && (
            <div className="portal-edit-form">
              <h3>Edit Portal</h3>
              <div className="edit-form-group">
                <label htmlFor="portal-title">Title:</label>
                <input
                  id="portal-title"
                  type="text"
                  value={editPortalTitle}
                  onChange={(e) => setEditPortalTitle(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-url">URL:</label>
                <input
                  id="portal-url"
                  type="text"
                  value={editPortalUrl}
                  onChange={(e) => setEditPortalUrl(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-office">Office:</label>
                  <select
                    id="portal-office"
                    value={editPortalOffice}
                    onChange={e => setEditPortalOffice(e.target.value)}
                    className="office-select"
                  >
                      <option value="None">Select Office</option>
                      <option value="Admissions Office">Admissions Office</option>
                      <option value="Library Office">Library Office</option>
                      <option value="Examinations Office">Examinations Office</option>
                      <option value="Academic Office">Academic Office</option>
                      <option value="Student Affairs Office">Student Affairs Office</option>
                      <option value="Mess Office">Mess Office</option>
                      <option value="Hostel Office">Hostel Office</option>
                      <option value="Alumni Cell">Alumni Cell</option>
                      <option value="Faculty Portal">Faculty Portal</option>
                      <option value="Placement Cell">Placement Cell</option>
                      <option value="Outreach Office">Outreach Office</option>
                      <option value="Statistical Cell">Statistical Cell</option>
                      <option value="R&D Office">R&D Office</option>
                      <option value="General Administration">General Administration</option>
                      <option value="Accounts Office">Accounts Office</option>
                      <option value="IT Services Office">IT Services Office</option>
                      <option value="Communication Office">Communication Office</option>
                      <option value="Engineering Office">Engineering Office</option>
                      <option value="HR & Personnel">HR & Personnel</option>
                  </select>
              </div>
              <div className="edit-form-group">
                <label htmlFor="portal-icon">Icon:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Input field for custom icon */}
                  <input
                    id="portal-icon"
                    type="text"
                    value={editPortalIcon}
                    onChange={(e) => setEditPortalIcon(e.target.value)}
                    maxLength={2}
                    placeholder="Custom Icon"
                  />
                  {/* Dropdown for predefined icons */}
                  <select
                    value={editPortalIcon}
                    onChange={(e) => setEditPortalIcon(e.target.value)}
                    className="icon-dropdown"
                  >
                    <option value="🔗">🔗 </option>
                    <option value="📁">📁 </option>
                    <option value="🌐">🌐 </option>
                    <option value="📄">📄 </option>
                    <option value="⚙️">⚙️ </option>
                  </select>
                </div>
              </div>
              <div className="edit-buttons">
                <button onClick={savePortal} className="save-btn">Save</button>
                <button onClick={cancelEditingPortal} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          {portalsLoading ? (
            <div className="portals-loading">Loading portals...</div>
          ) : portalsError ? (
            <div className="portals-error">{portalsError}</div>
          ) : portals.length > 0 ? (
            <div className="iiit-portals-grid">
              {isEditingPortals ?
                portals.map((portal, index) => (
                  <div key={index} className="portal-item-admin">
                    {renderLinkComponent(
                      portal,
                      index,
                      "portal-link",
                      true,
                      startEditingPortal,
                      togglePortalPin,
                      removePortal
                    )}
                  </div>
                )) :
                portals
                  .filter(portal => portal.pinned) // Only display pinned portals
                  .map((portal, index) =>
                    renderLinkComponent(portal, index, "portal-link", false)
                  )
              }
            </div>
          ) : (
            <div className="no-portals">No portals available</div>
          )}
        </div>
      </div>
      {/* Quick Links Section - With editing capabilities */}
      <div className="quick-links-section" id="quick-links">
        <div className="quick-links-container">
          <div className="section-header">
            <h2 className="section-title">Quick Links</h2>
            <button
              className="edit-section-btn"
              onClick={() => setIsEditingQuickLinks(!isEditingQuickLinks)}
              aria-label="Edit quick links"
              title="Edit quick links"
            >
              <img src={editIcon} alt="Edit" className="action-icon" />
            </button>
          </div>

          {isEditingQuickLinks && !isAddingQuickLink && selectedQuickLinkIndex === null && (

            <div className="edit-actions">
              <button onClick={startAddingQuickLink} className="add-btn">
                Add New Link
              </button>
              {/* <button onClick={cancelEditingQuickLink} className="cancel-btn">
                  Done Editing
                </button> */}
            </div>

          )}

          {isEditingQuickLinks && isAddingQuickLink && (
            <div className="quick-link-edit-form">
              <h3>Add New Quick Link</h3>
              <div className="edit-form-group">
                <label htmlFor="quick-link-title">Title:</label>
                <input
                  id="quick-link-title"
                  type="text"
                  value={editQuickLinkTitle}
                  onChange={(e) => setEditQuickLinkTitle(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="quick-link-url">URL:</label>
                <input
                  id="quick-link-url"
                  type="text"
                  value={editQuickLinkUrl}
                  onChange={(e) => setEditQuickLinkUrl(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="quick-link-office">Office:</label>
                <select
                  id="quick-link-office"
                  value={editQuickLinkOffice}
                  onChange={(e) => setEditQuickLinkOffice(e.target.value)}
                  className="office-select"
                >
                  <option value="None">Select Office</option>
                  <option value="Admissions Office">Admissions Office</option>
                  <option value="Academic Office">Academic Office</option>
                  <option value="Library Office">Library Office</option>
                  <option value="Examinations Office">Examinations Office</option>
                  <option value="Student Affairs Office">Student Affairs Office</option>
                  <option value="Hostel Office">Hostel Office</option>
                  <option value="Mess Office">Mess Office</option>
                  <option value="Alumni Cell">Alumni Cell</option>
                  <option value="Faculty Portal">Faculty Portal</option>
                  <option value="Placement Cell">Placement Cell</option>
                  <option value="Outreach Office">Outreach Office</option>
                  <option value="Statistical Cell">Statistical Cell</option>
                  <option value="R&D Office">R&D Office</option>
                  <option value="General Administration">General Administration</option>
                  <option value="Accounts Office">Accounts Office</option>
                  <option value="IT Services Office">IT Services Office</option>
                  <option value="Communication Office">Communication Office</option>
                  <option value="Engineering Office">Engineering Office</option>
                  <option value="HR & Personnel">HR & Personnel</option>
                </select>
              </div>
              <div className="edit-buttons">
                <button onClick={saveNewQuickLink} className="save-btn">Save</button>
                <button onClick={cancelEditingQuickLink} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          {isEditingQuickLinks && selectedQuickLinkIndex !== null && (
            <div className="quick-link-edit-form">
              <h3>Edit Quick Link</h3>
              <div className="edit-form-group">
                <label htmlFor="quick-link-title">Title:</label>
                <input
                  id="quick-link-title"
                  type="text"
                  value={editQuickLinkTitle}
                  onChange={(e) => setEditQuickLinkTitle(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="quick-link-url">URL:</label>
                <input
                  id="quick-link-url"
                  type="text"
                  value={editQuickLinkUrl}
                  onChange={(e) => setEditQuickLinkUrl(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="quick-link-office">Office:</label>
                <select
                  id="quick-link-office"
                  value={editQuickLinkOffice}
                  onChange={(e) => setEditQuickLinkOffice(e.target.value)}
                  className="office-select"
                >
                  <option value="None">Select Office</option>
                  <option value="Admissions Office">Admissions Office</option>
                  <option value="Academic Office">Academic Office</option>
                  <option value="Library Office">Library Office</option>
                  <option value="Examinations Office">Examinations Office</option>
                  <option value="Student Affairs Office">Student Affairs Office</option>
                  <option value="Hostel Office">Hostel Office</option>
                  <option value="Mess Office">Mess Office</option>
                  <option value="Alumni Cell">Alumni Cell</option>
                  <option value="Faculty Portal">Faculty Portal</option>
                  <option value="Placement Cell">Placement Cell</option>
                  <option value="Outreach Office">Outreach Office</option>
                  <option value="Statistical Cell">Statistical Cell</option>
                  <option value="R&D Office">R&D Office</option>
                  <option value="General Administration">General Administration</option>
                  <option value="Accounts Office">Accounts Office</option>
                  <option value="IT Services Office">IT Services Office</option>
                  <option value="Communication Office">Communication Office</option>
                  <option value="Engineering Office">Engineering Office</option>
                  <option value="HR & Personnel">HR & Personnel</option>
                </select>
              </div>
              <div className="edit-buttons">
                <button onClick={saveQuickLink} className="save-btn">Save</button>
                <button onClick={cancelEditingQuickLink} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

          {quickLinksLoading ? (
            <div className="quick-links-loading">Loading quick links...</div>
          ) : quickLinksError ? (
            <div className="quick-links-error">{quickLinksError}</div>
          ) : displayedQuickLinks.length > 0 ? (
            <div className="quick-links-grid">
              {displayedQuickLinks.map((link, index) => (
                <div key={index} className="quick-link-item-admin">
                  {renderLinkComponent(
                    link,
                    index,
                    "quick-link",
                    isEditingQuickLinks,
                    startEditingQuickLink,
                    toggleQuickLinkPin,
                    removeQuickLink
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-quick-links">No quick links available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeAdmin;