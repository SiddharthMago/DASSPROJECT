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
	const [filterOffice, setFilterOffice] = useState('all');

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
				<h1 className="page-title">USERS</h1>
				<p class="page-subtitle">All users registered on Intranet network</p>

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
							<div key={contact.email || Math.random()} className="contact-card admin-contact-card">
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
									</div>
								</div>
							</div>
						))
					) : (
						!loading && (
							<div className="no-results">
								<p>No users found matching your criteria.</p>
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
}

export default ContactsUser;