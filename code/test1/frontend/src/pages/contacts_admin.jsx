import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/contacts.css';
import { contactService } from "../services/api";

function ContactsAdmin({ darkMode }) {
    const navigate = useNavigate();
    // State for mobile menu toggle
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterOffice, setFilterOffice] = useState('all');

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    // New contact state
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        email: '',
        office: '',
        role: 'user',
        // profile_pic: null
    });

    // Image upload state
    const [formSubmitting, setFormSubmitting] = useState(false);

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

    useEffect(() => {
        fetchContacts();
    }, []);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Filter contacts by role, office and search term with null checks
    const filteredContacts = contacts.filter(contact => {
        // Check if contact is valid
        if (!contact) return false;

        // Check for role match
        const matchesRole = filterRole === 'all' || contact.role === filterRole;

        // Check for office match
        const matchesOffice = filterOffice === 'all' || contact.office === filterOffice;

        // Check for search term match with null checks
        const matchesSearch =
            (contact.name ? contact.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
            (contact.email ? contact.email.toLowerCase().includes(searchTerm.toLowerCase()) : false);

        return matchesRole && matchesOffice && matchesSearch;
    });

    // Start editing a contact
    const startEditing = (contact) => {
        const fresh = contacts.find(c => c.email === contact.email);
        setEditingContact({ ...fresh });
        setIsEditing(true);
    };

    // Handle edit form input changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingContact(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload for editing
    // const handleEditImageChange = (e) => {
    //     if (e.target.files && e.target.files[0]) {
    //         const file = e.target.files[0];
    //         setSelectedImage(file);
    //         setEditingContact(prev => ({
    //             ...prev,
    //             profile_pic: URL.createObjectURL(file)
    //         }));
    //     }
    // };

    // Save edited contact
    const saveEditedContact = async () => {
        try {
            setFormSubmitting(true);
            console.log("Editing contact before submission:", editingContact);

            const contactData = {
                name: editingContact.name,
                office: editingContact.office,
                role: editingContact.role,
            };

            // if (selectedImage) {
            //     contactData.profile_pic = selectedImage;
            // }

            await contactService.updateContact(editingContact.email, contactData);

            setIsEditing(false);
            setEditingContact(null);

            fetchContacts();
        }
        catch (err) {
            console.error("Error updating the contact: ", err);
            setError("Failed to update the contact. " + (err.response?.data?.error || ""));
        }
        finally {
            setFormSubmitting(false);
        }
    };

    // Cancel editing
    const cancelEditing = () => {
        setIsEditing(false);
        setEditingContact(null);
    };

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

    // Delete a contact
    const deleteContact = async (email) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await contactService.deleteContact(email);
                setContacts(contacts.filter(contact => contact.email !== email));
            }
            catch (err) {
                console.error("Error deleting contact: ", err);
                setError("Failed to delete contact. " + (err.response?.data?.error || ""));
            }
        }
    };

    // Start adding a new contact
    const startAddingContact = () => {
        setIsAddingContact(true);
        setNewContact({
            name: '',
            email: '',
            office: '',
            role:   'user',
            // profile_pic: null
        });
    };

    // Handle new contact form changes
    const handleNewContactChange = (e) => {
        const { name, value } = e.target;
        setNewContact(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload for new contact
    // const handleNewImageChange = (e) => {
    //     if (e.target.files && e.target.files[0]) {
    //         const file = e.target.files[0];
    //         setSelectedImage(file);
    //         setNewContact(prev => ({
    //             ...prev,
    //             profile_pic: URL.createObjectURL(file)
    //         }));
    //     }
    // };

    // Save new contact
    const saveNewContact = async () => {
        if (!newContact.name || !newContact.email) {
            alert('Name and Email are required!');
            return;
        }

        try {
            setFormSubmitting(true);
            const contactData = { ...newContact };

            // if (selectedImage) {
            //     contactData.profile_pic = selectedImage;
            // }

            await contactService.addContact(contactData);

            setIsAddingContact(false);
            setNewContact({
                name: '',
                email: '',
                office: '',
                role:   'user',
                // profile_pic: null
            });

            fetchContacts();
        }
        catch (err) {
            console.error("Error adding contacts: ", err);
            setError("Failed to add contact: " + (err.response?.data?.error || ""));
        }
        finally {
            setFormSubmitting(false);
        }
    };

    // Cancel adding new contact
    const cancelAddingContact = () => {
        setIsAddingContact(false);
        setNewContact({
            name: '',
            email: '',
            office: '',
            role: 'user',
            // profile_pic: null
        });
    };

    const roles = {
		admin: "Admin",
		user: "User",
		superadmin: "Super admin"
	};

    return (
        <div className={`contacts-container ${darkMode ? 'dark-mode' : ''}`}>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
            />

            {/* Main Content */}
            <div className="contacts-content">
                <div>
                    <h1 className="page-title">USERS</h1>
                    <p class="page-subtitle">All users registered on Intranet network</p>

                    <button className="add-contact-btn" onClick={startAddingContact}>
                        Add New Contact
                    </button>
                </div>

                {/* Add new contact form */}
                {isAddingContact && (
                    <div className="edit-contact-overlay">
                        <div className="edit-contact-form">
                            <h2>Add New Contact</h2>

                            {/* <div className="edit-form-group">
                                <label>Profile Image</label>
                                <div className="edit-image-container">
                                    <div className="contact-image-container edit-image-preview">
                                        {newContact.profile_pic ? (
                                            <img
                                            src="../../../backend/uploads/user_pics/default.jpeg"
                                            alt="Profile preview"
                                            className="contact-image"
                                            />
                                        ) : (
                                            <div className='no-image'>No image selected.</div>
                                        )}
                                    </div>
                                    <div className="edit-image-actions">
                                        <label className="custom-file-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleNewImageChange}
                                            />
                                            Choose Image
                                        </label>
                                    </div>
                                </div>
                            </div> */}

                            <div className="edit-form-group">
                                <label>Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newContact.name}
                                    onChange={handleNewContactChange}
                                    required
                                />
                            </div>

                            <div className="edit-form-group">
                                <label>Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newContact.email}
                                    onChange={handleNewContactChange}
                                    required
                                />
                            </div>

                            <div className="edit-form-group">
                                <label>Office</label>
                                <select
                                    name="office"
                                    value={newContact.office}
                                    onChange={handleNewContactChange}
                                >
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
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={newContact.role}
                                    onChange={handleNewContactChange}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super admin</option>
                                </select>
                            </div>

                            <div className="edit-form-actions">
                                <button className="btn-save" onClick={saveNewContact} disabled={formSubmitting}>{formSubmitting ? "Saving..." : "Save"}</button>
                                <button className="btn-cancel" onClick={cancelAddingContact}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit contact form */}
                {isEditing && editingContact && (
                    <div className="edit-contact-overlay">
                        <div className="edit-contact-form">
                            <h2>Edit Contact</h2>

                            {/* <div className="edit-form-group">
                                <label>Profile Image</label>
                                <div className="edit-image-container">
                                    <div className="contact-image-container edit-image-preview">
                                        <img
                                            src="/uploads/user_pics/default.jpeg"
                                            alt="Profile preview"
                                            className="contact-image"
                                        />
                                    </div>
                                    <div className="edit-image-actions">
                                        <label className="custom-file-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditImageChange}
                                            />
                                            Change Image
                                        </label>
                                    </div>
                                </div>
                            </div> */}

                            <div className="edit-form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingContact.name}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="edit-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editingContact.email}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="edit-form-group">
                                <label>Office</label>
                                <select
                                    name="office"
                                    value={editingContact.office || ""}
                                    onChange={handleEditChange}
                                >
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
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={editingContact.role || "user"}
                                    onChange={handleEditChange}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super admin</option>
                                </select>
                            </div>

                            <div className="edit-form-actions">
                                <button className="btn-save" onClick={saveEditedContact} disabled={formSubmitting}>{formSubmitting ? "Saving..." : "Save"}</button>
                                <button className="btn-cancel" onClick={cancelEditing}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

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

                    <div className="office-filter">
                            <label>Office:</label>
                            <select
                                value={filterOffice}
                                onChange={(e) => setFilterOffice(e.target.value)}
                            >
                                <option value="all">All Offices</option>
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
                                {/* <div className="contact-image-container">
                                    {contact.profile_pic ? (
                                        <img
                                            src="../../../backend/uploads/user_pics/default.jpeg"
                                            alt={`${contact.name || "Contact"} profile`}
                                            className="contact-image"
                                            onError={(e) => {
                                                e.target.src = "uploads/user_pics/default/jpeg";
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="/uploads/user_pics/default.jpeg"
                                            alt="Default profile"
                                            className='contact-image'
                                        />
                                    )}

                                </div> */}
                                <div className="contact-details">
                                    <h2 className="contact-name">{contact.name || 'No Name'}</h2>
                                    <a href={`mailto:${contact.email}`} className="contact-email">
                                        {contact.email || 'No Email'}
                                    </a>

                                    {contact.office && contact.office !== "None" && (
                                        <div className='office-indicator'>{contact.office}</div>
                                    )}

                                    <div className="role-indicator">
                                        <span className={`role-badge ${contact.role || 'user'}`}>
                                            {roles[contact.role] || 'user'}
                                        </span>
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

                                    <div className="contact-actions">
                                        <button
                                            className="action-button edit"
                                            onClick={() => startEditing(contact)}
                                            title="Edit contact"
                                        >
                                            Edit
                                        </button>
                                        
                                        <button
                                            className="action-button delete"
                                            onClick={() => deleteContact(contact.email)}
                                            title="Delete contact"
                                        >
                                            Delete
                                        </button>
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