import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/contacts.css';
import iiithLogo from '../assets/iiit-logo.png';
import { contactService } from '../services/api';

function ContactsUser({ darkMode }) {
	// State for mobile menu toggle
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [contacts, setContacts] = useState([]);
	const [error, setError] = useState(null);

	// Filter state
	const [filterRole, setFilterRole] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');

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
				<h1 className="page-title">Contacts Directory</h1>

				{/* Filters and Search */}
				<div className="contacts-filters">
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
				<div className="contacts-grid">
					{!loading && filteredContacts.length > 0 ? (
						filteredContacts.map(contact => (
							<div key={contact.email || Math.random()} className="contact-card">
								{/* <div className="contact-image-container">
								</div> */}
								<div className="contact-details">
									<h2 className="contact-name">{contact.name || 'No Name'}</h2>

									<a href={`mailto:${contact.email}`} className="contact-email">
										{contact.email || 'No Email'}
									</a>

									{contact.office && contact.office !== "None" && (
										<div className='office-indicator'>{contact.office}</div>
									)}

									{contact.role && contact.role !== "None" && (
										<div className='office-indicator'>{roles[contact.role]}</div>
									)}

									{/* Optionally display role badge */}
									<div className="role-indicator">
										<span className={`role-badge ${contact.role || 'user'}`}>
											{contact.role || 'user'}
										</span>
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

export default ContactsUser;