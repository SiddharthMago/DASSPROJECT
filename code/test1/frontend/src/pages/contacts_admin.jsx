import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/contacts.css';
import { contactService } from "../services/api";

function ContactsAdmin({ darkMode }) {
    // State for mobile menu toggle
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoading(true);
                const response = await contactService.getAllUsers();
                setContacts(response.data.data);
                setError(null);
            }
            catch (err) {
                console.error("Error fetching contacts: ", err);
                setError("Failed to load contacts.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Filter contacts by role and search term with null checks
    const filteredContacts = contacts.filter(contact => {
        // Check if contact is valid
        if (!contact) return false;
        
        // Check for role match
        const matchesRole = filterRole === 'all' || contact.role === filterRole;
        
        // Check for search term match with null checks
        const matchesSearch = 
            (contact.name ? contact.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
            (contact.email ? contact.email.toLowerCase().includes(searchTerm.toLowerCase()) : false);
        
        return matchesRole && matchesSearch;
    });

    // Change role function
    const changeRole = async (email, newRole) => {
        try {
            await contactService.changeContactRole(email, newRole);
            setContacts(contacts.map(contact =>
                contact.email === email ? {
                    ...contact,
                    role: newRole
                } : contact
            ));
        }
        catch (err) {
            console.error("Error changing role: ", err);
            setError("Failed to change role.");
        }
    };

    return (
        <div className={`contacts-container ${darkMode ? 'dark-mode' : ''}`}>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
            />

            {/* Main Content */}
            <div className="contacts-content">
                <h1 className="page-title">Contacts Directory</h1>

                {/* Filters and Search */}
                <div className="contacts-filters admin-filters">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button">🔍</button>
                    </div>

                    <div className="filters-row">
                        <div className="role-filters">
                            <button
                                className={filterRole === 'all' ? 'active' : ''}
                                onClick={() => setFilterRole('all')}
                            >
                                All Roles
                            </button>
                            <button
                                className={filterRole === 'user' ? 'active' : ''}
                                onClick={() => setFilterRole('user')}
                            >
                                Users
                            </button>
                            <button
                                className={filterRole === 'admin' ? 'active' : ''}
                                onClick={() => setFilterRole('admin')}
                            >
                                Admins
                            </button>
                            <button
                                className={filterRole === 'superadmin' ? 'active' : ''}
                                onClick={() => setFilterRole('superadmin')}
                            >
                                Super Admins
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {loading && <div className="loading-message">Loading contacts...</div>}
                
                {/* Error state */}
                {error && <div className="error-message">{error}</div>}

                {/* Contact Cards */}
                <div className="contacts-grid admin-grid">
                    {!loading && filteredContacts.length > 0 ? (
                        filteredContacts.map(contact => (
                            <div key={contact.email} className="contact-card admin-contact-card">
                                <div className="contact-image-container">
                                    {/* Image placeholder */}
                                </div>
                                <div className="contact-details">
                                    <h2 className="contact-name">{contact.name || 'No Name'}</h2>
                                    <a href={`mailto:${contact.email}`} className="contact-email">
                                        {contact.email || 'No Email'}
                                    </a>

                                    {contact.office && contact.office !== "None" && (
                                        <div className='office-indicator'>{contact.office}</div>
                                    )}

                                    <div className="role-indicator">
                                        Role: <span className={`role-badge ${contact.role || 'user'}`}>{contact.role || 'user'}</span>
                                    </div>

                                    <div className="contact-actions">
                                        <div className="role-dropdown">
                                            <select
                                                value={contact.role || 'user'}
                                                onChange={(e) => changeRole(contact.email, e.target.value)}
                                                className="role-select"
                                                title="Change role"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="superadmin">Super admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <div className="no-results">
                                <p>No contacts found matching your criteria.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default ContactsAdmin;