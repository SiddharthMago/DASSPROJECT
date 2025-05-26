import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/archive.css';
import { FaTh, FaList, FaPlus, FaTrash } from 'react-icons/fa';

// Cache for API responses
const apiCache = {
	files: null,
	announcements: null,
	quicklinks: null,
	lastFetch: null,
	CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

function Archive({ darkMode, userRole }) {
	// State for filtering
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedOffice, setSelectedOffice] = useState('All');
	const [activeTab, setActiveTab] = useState('All');
	const [archiveItems, setArchiveItems] = useState([]);
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [expandedFileId, setExpandedFileId] = useState(null);
	const [layout, setLayout] = useState('grid'); // 'grid' or 'table'

	// Add new state for delete confirmation modal
	const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null, itemName: '', category: '' });

	// Add new state for announcement modal
	const [announcementModal, setAnnouncementModal] = useState({
		show: false,
		title: '',
		office: '',
		link: '',
		image: null
	});

	// Add new state for link modal
	const [linkModal, setLinkModal] = useState({
		show: false,
		title: '',
		office: '',
		url: '',
		pinned: false // Set pinned to false by default
	});

	// Add new state for edit announcement modal
	const [editAnnouncementModal, setEditAnnouncementModal] = useState({
		show: false,
		id: null,
		title: '',
		office: '',
		link: '',
		image: null
	});

	// Add new state for edit link modal
	const [editLinkModal, setEditLinkModal] = useState({
		show: false,
		id: null,
		title: '',
		office: '',
		url: '',
		pinned: true
	});

	// Add userOffice state to store the admin's office
	const [userOffice, setUserOffice] = useState('');

	// Add new state for author details
	const [authorDetails, setAuthorDetails] = useState({});

	// Set active tab from URL parameter on component mount
	useEffect(() => {
		const tabParam = searchParams.get('tab');
		if (tabParam && ['All', 'Files', 'Announcements', 'Links'].includes(tabParam)) {
			setActiveTab(tabParam);
		}
	}, [searchParams]);

	// Add useEffect to fetch user's office when component mounts
	useEffect(() => {
		const fetchUserOffice = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get('http://localhost:5000/api/auth_cas/current', {
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});
				if (response.data.success) {
					setUserOffice(response.data.data.office);
				}
			} catch (err) {
				console.error('Error fetching user office:', err);
			}
		};

		if (userRole === 'admin') {
			fetchUserOffice();
		}
	}, [userRole]);

	// Function to fetch author details
	const fetchAuthorDetails = async (authorId) => {
		// Skip if authorId is missing, already fetched, or not a string
		if (!authorId || authorDetails[authorId] || typeof authorId !== 'string') return;

		try {
			console.log("[archive] fetching author details for ID:", authorId);
			const token = localStorage.getItem('token');
			const response = await axios.get(`http://localhost:5000/api/auth_cas/user?id=${authorId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (response.data.success) {
				setAuthorDetails(prev => ({
					...prev,
					[authorId]: response.data.data.name
				}));
			}
		} catch (err) {
			console.error('Error fetching author details:', err);
		}
	};

	const location = useLocation();
	const getRoleFromURL = () => {
		return location.pathname.split('/')[1] || "user";
	}

	// Update the file mapping to use author ObjectId
	const mapFileData = useCallback((file) => {
		// Standardize the file path construction for both view and download
		console.log("[archive] mapping filedata for file: ", file._id);
		const filePath = file.filePath ? `/${file.filePath.replace(/\\/g, '/')}` : null;

		const role = getRoleFromURL();
		const viewURL = filePath ? `/${role}/file/${file._id}` : null;

		// Check if the file has multiple versions
		const hasMultipleVersions = file.versions && file.versions.length > 0;

		let authorName = "Unknown";
		if (file.author) {
			if (typeof file.author === "object" && file.author.name) {
				authorName = file.author.name;
			}
			else if (typeof file.author === "string" && authorDetails[file.author]) {
				authorName = authorDetails[file.author];
			}
			else if (typeof file.author === "string") {
				fetchAuthorDetails(file.author);
			}
		}

		console.log('[archive] generated viewurl:', viewURL);
		const mappedFile = {
			id: file._id,
			fileName: hasMultipleVersions ? `${file.name} *` : file.name, // Add asterisk for files with versions
			authorId: file.author, // Store the author ObjectId
			author: file.author ? file.author.name : file.office, // Default to office name if not available
			office: file.office,
			modifiedDate: new Date(file.createdAt).toLocaleDateString(),
			category: 'Files',
			// Only set viewUrl if there's a filePath
			viewURL: viewURL,
			// Use URL if available, otherwise use filepath
			downloadUrl: file.url || (filePath ? `http://localhost:5000${filePath}` : null),
			// Track if file has multiple versions
			hasVersions: hasMultipleVersions
		};

		// // If we have the author details, update the author name
		// if (file.author && authorDetails[file.author]) {
		// 	mappedFile.author = authorDetails[file.author];
		// } else if (file.author) {
		// 	// Fetch author details if we don't have them
		// 	fetchAuthorDetails(file.author);
		// }

		return mappedFile;
	}, [authorDetails]);

	// Map announcement data consistently
	const mapAnnouncementData = useCallback((announcement) => {
		let authorName = "Unknown";
		if (announcement.author) {
			if (typeof announcement.author === "object" && announcement.author.name) {
				authorName = announcement.author.name;
			}
			else if (typeof announcement.author === "string" && authorDetails[announcement.author]) {
				authorName = authorDetails[announcement.author];
			}
			else if (typeof announcement.author === "string") {
				fetchAuthorDetails(announcement.author);
			}
		}
		const mappedAnnouncement = {
			id: announcement._id,
			fileName: announcement.title,
			authorId: announcement.author, // Store the author ObjectId
			author: announcement.author ? announcement.author.name : announcement.office, // Default to office name as fallback
			office: announcement.office,
			modifiedDate: new Date(announcement.createdAt).toLocaleDateString(),
			category: 'Announcements',
			downloadUrl: announcement.link || '#',
			image: announcement.image
		};

		// // If we have the author details, update the author name
		// if (announcement.author && authorDetails[announcement.author]) {
		// 	mappedAnnouncement.author = authorDetails[announcement.author];
		// } else if (announcement.author) {
		// 	// Fetch author details if we don't have them
		// 	fetchAuthorDetails(announcement.author);
		// }

		return mappedAnnouncement;
	}, [authorDetails]);

	// Map quickLink data consistently
	const mapQuickLinkData = useCallback((quickLink) => {
		let authorName = "Unknown";
		if (quickLink.author) {
			if (typeof quickLink.author === "object" && quickLink.author.name) {
				authorName = quickLink.author.name;
			}
			else if (typeof quickLink.author === "string" && authorDetails[quickLink.author]) {
				authorName = authorDetails[quickLink.author];
			}
			else if (typeof quickLink.author === "string") {
				fetchAuthorDetails(quickLink.author);
			}
		}
		const mappedQuickLink = {
			id: quickLink._id,
			fileName: quickLink.title,
			authorId: quickLink.author, // Store the author ObjectId
			author: quickLink.author ? quickLink.author.name : quickLink.office, // Default to office name as fallback
			office: quickLink.office,
			modifiedDate: new Date(quickLink.createdAt).toLocaleDateString(),
			category: 'Links',
			downloadUrl: quickLink.url,
			pinned: quickLink.pinned
		};

		// // If we have the author details, update the author name
		// if (quickLink.author && authorDetails[quickLink.author]) {
		// 	mappedQuickLink.author = authorDetails[quickLink.author];
		// } else if (quickLink.author) {
		// 	// Fetch author details if we don't have them
		// 	fetchAuthorDetails(quickLink.author);
		// }

		return mappedQuickLink;
	}, []);

	// Memoized filtered items
	const filteredItems = useMemo(() => {
		return archiveItems.filter((item) => {
			const matchesCategory = activeTab === 'All' ||
				(activeTab === 'Uploaded by Me' ? true : item.category === activeTab);
			const matchesOffice =
				selectedOffice === 'All' || item.office.toLowerCase().includes(selectedOffice.toLowerCase());
			const matchesSearch =
				searchQuery === '' || item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesCategory && matchesOffice && matchesSearch;
		});
	}, [archiveItems, activeTab, selectedOffice, searchQuery]);

	// Memoized fetch functions
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const now = Date.now();

			// Check if we have cached data that's still valid
			if (apiCache.lastFetch && (now - apiCache.lastFetch) < apiCache.CACHE_DURATION) {
				if (activeTab === 'All' && apiCache.files && apiCache.announcements && apiCache.quicklinks) {
					const files = apiCache.files.map(mapFileData);
					const announcements = apiCache.announcements.map(mapAnnouncementData);
					const quickLinks = apiCache.quicklinks.map(mapQuickLinkData);
					const allItems = [...files, ...announcements, ...quickLinks].sort((a, b) =>
						new Date(b.modifiedDate) - new Date(a.modifiedDate)
					);
					setArchiveItems(allItems);
					setLoading(false);
					return;
				}
			}

			if (activeTab === 'All') {
				const [filesRes, announcementsRes, quickLinksRes] = await Promise.all([
					axios.get('http://localhost:5000/api/files/approved'),
					axios.get('http://localhost:5000/api/announcements'),
					axios.get('http://localhost:5000/api/quicklinks')
				]);

				// Cache the responses
				apiCache.files = filesRes.data.data;
				apiCache.announcements = announcementsRes.data.data;
				apiCache.quicklinks = quickLinksRes.data.data;
				apiCache.lastFetch = now;

				const files = filesRes.data.data.map(mapFileData);
				const announcements = announcementsRes.data.data.map(mapAnnouncementData);
				const quickLinks = quickLinksRes.data.data.map(mapQuickLinkData);

				const allItems = [...files, ...announcements, ...quickLinks].sort((a, b) =>
					new Date(b.modifiedDate) - new Date(a.modifiedDate)
				);
				setArchiveItems(allItems);
			} else if (activeTab === 'Files') {
				const res = await axios.get('http://localhost:5000/api/files/approved');
				apiCache.files = res.data.data;
				apiCache.lastFetch = now;
				const mapped = res.data.data.map(mapFileData);
				setArchiveItems(mapped);
			} else if (activeTab === 'Announcements') {
				const res = await axios.get('http://localhost:5000/api/announcements');
				apiCache.announcements = res.data.data;
				apiCache.lastFetch = now;
				const mapped = res.data.data.map(mapAnnouncementData);
				setArchiveItems(mapped);
			} else if (activeTab === 'Links') {
				const res = await axios.get('http://localhost:5000/api/quicklinks');
				apiCache.quicklinks = res.data.data;
				apiCache.lastFetch = now;
				const mapped = res.data.data.map(mapQuickLinkData);
				setArchiveItems(mapped);
			} else if (activeTab === 'Uploaded by Me') {
				const token = localStorage.getItem('token');
				if (!token) {
					console.error('No token found');
					setError('Please log in to view your uploaded content');
					setLoading(false);
					return;
				}

				try {
					// Fetch all content types uploaded by the current user
					const [filesRes, announcementsRes, quickLinksRes] = await Promise.all([
						axios.get('http://localhost:5000/api/files/my-files', {
							headers: { Authorization: `Bearer ${token}` }
						}),
						axios.get('http://localhost:5000/api/announcements/my-announcements', {
							headers: { Authorization: `Bearer ${token}` }
						}),
						axios.get('http://localhost:5000/api/quicklinks/my-links', {
							headers: { Authorization: `Bearer ${token}` }
						})
					]);

					// Map each content type using the appropriate mapping functions
					const files = filesRes.data.data.map(file => {
						const filePath = file.filePath ? `/${file.filePath.replace(/\\/g, '/')}` : '';
						const role = getRoleFromURL();
						const viewURL = `/${role}/file/${file._id}`;

						return {
							id: file._id,
							fileName: file.name,
							author: file.author?.name || "Unknown",
							office: file.office,
							modifiedDate: new Date(file.createdAt).toLocaleDateString(),
							category: 'Files',
							status: file.status,
							comments: file.comments || [],
							rejectionComment: file.rejectionComment,
							viewURL: viewURL,
							downloadUrl: file.url || (filePath ? `http://localhost:5000${filePath}` : null),
						};
					});

					const announcements = announcementsRes.data.data.map(announcement => {
						return {
							id: announcement._id,
							fileName: announcement.title,
							author: announcement.author?.name || "Unknown",
							office: announcement.office,
							modifiedDate: new Date(announcement.createdAt).toLocaleDateString(),
							category: 'Announcements',
							status: announcement.status,
							comments: announcement.comments || [],
							rejectionComment: announcement.rejectionComment,
							downloadUrl: announcement.link || '#',
							image: announcement.image
						};
					});

					const quickLinks = quickLinksRes.data.data.map(link => {
						return {
							id: link._id,
							fileName: link.title,
							author: link.author?.name || 'Unknown',
							office: link.office,
							modifiedDate: new Date(link.createdAt).toLocaleDateString(),
							category: 'Links',
							status: link.status,
							comments: link.comments || [],
							rejectionComment: link.rejectionComment,
							downloadUrl: link.url,
							pinned: link.pinned
						};
					});

					// Combine all items and sort by date
					const allUserItems = [...files, ...announcements, ...quickLinks].sort((a, b) =>
						new Date(b.modifiedDate) - new Date(a.modifiedDate)
					);

					setArchiveItems(allUserItems);
				} catch (err) {
					console.error('Error fetching user content:', err);
					setError('Failed to fetch your uploaded content: ' + (err.response?.data?.error || err.message));
				} finally {
					setLoading(false);
				}
			}
		} catch (err) {
			console.error('Failed to fetch data:', err);
			setError(err.response?.data?.error || 'Failed to fetch data');
		} finally {
			setLoading(false);
		}
	}, [activeTab, mapFileData, mapAnnouncementData, mapQuickLinkData]);

	// Fetch data when activeTab changes
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const toggleComments = (fileId) => {
		setExpandedFileId(expandedFileId === fileId ? null : fileId);
	};

	// Helper function to check if user has permission to manage an item
	const canManageItem = (itemOffice) => {
		if (userRole === 'superadmin') return true;
		if (userRole === 'admin') return itemOffice === userOffice;
		return false;
	};

	// Function to handle item deletion
	const handleDelete = async (id, category) => {
		try {
			const token = localStorage.getItem('token');
			let endpoint;

			// Determine the correct endpoint based on the category
			switch (category) {
				case 'Files':
					endpoint = `http://localhost:5000/api/files/${id}`;
					break;
				case 'Announcements':
					endpoint = `http://localhost:5000/api/announcements/${id}`;
					break;
				case 'Links':
					endpoint = `http://localhost:5000/api/quicklinks/${id}`;
					break;
				default:
					throw new Error('Invalid category for deletion');
			}

			const response = await axios.delete(endpoint, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.data.success) {
				// Refresh the items list based on the current tab
				if (activeTab === 'All') {
					const [filesRes, announcementsRes, quickLinksRes] = await Promise.all([
						axios.get('http://localhost:5000/api/files/approved'),
						axios.get('http://localhost:5000/api/announcements'),
						axios.get('http://localhost:5000/api/quicklinks')
					]);

					// Use mapFileData for files to properly handle author information
					const files = filesRes.data.data.map(mapFileData);

					const announcements = announcementsRes.data.data.map(mapAnnouncementData);

					const quickLinks = quickLinksRes.data.data.map(mapQuickLinkData);

					const allItems = [...files, ...announcements, ...quickLinks].sort((a, b) =>
						new Date(b.modifiedDate) - new Date(a.modifiedDate)
					);
					setArchiveItems(allItems);
				} else if (activeTab === 'Links') {
					const res = await axios.get('http://localhost:5000/api/quicklinks');
					const mapped = res.data.data.map(mapQuickLinkData);
					setArchiveItems(mapped);
				} else if (activeTab === 'Announcements') {
					const res = await axios.get('http://localhost:5000/api/announcements');
					const mapped = res.data.data.map(mapAnnouncementData);
					setArchiveItems(mapped);
				} else if (activeTab === 'Files') {
					const res = await axios.get('http://localhost:5000/api/files/approved');
					// Use mapFileData for files to properly handle author information
					const mapped = res.data.data.map(mapFileData);
					setArchiveItems(mapped);
				}

				setDeleteModal({ show: false, itemId: null, itemName: '', category: '' });
			} else {
				alert('Failed to delete item: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error deleting item:', err);
			alert('Failed to delete item: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to get the appropriate "Add New" route based on category
	const getAddNewRoute = () => {
		switch (activeTab) {
			case 'Files':
				return '/upload';
			case 'Announcements':
				return '/create-announcement';
			case 'Links':
				return '/create-link';
			default:
				return '#';
		}
	};

	// Function to handle announcement creation
	const handleCreateAnnouncement = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const formData = new FormData();

			formData.append('title', announcementModal.title);
			formData.append('office', userRole === 'superadmin' ? announcementModal.office : userOffice);
			formData.append('link', announcementModal.link);
			if (announcementModal.image) {
				formData.append('image', announcementModal.image);
			}

			const response = await axios.post('http://localhost:5000/api/announcements', formData, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'multipart/form-data'
				}
			});

			if (response.data.success) {
				// Refresh the announcements list
				const announcementsRes = await axios.get('http://localhost:5000/api/announcements');
				const mapped = announcementsRes.data.data.map(mapAnnouncementData);
				setArchiveItems(mapped);

				// Close modal and reset form
				setAnnouncementModal({
					show: false,
					title: '',
					office: '',
					link: '',
					image: null
				});
			} else {
				alert('Failed to create announcement: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error creating announcement:', err);
			alert('Failed to create announcement: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to handle file input change
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setAnnouncementModal({
				...announcementModal,
				image: e.target.files[0]
			});
		}
	};

	// Function to handle link creation
	const handleCreateLink = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const response = await axios.post('http://localhost:5000/api/quicklinks', {
				title: linkModal.title,
				office: userRole === 'superadmin' ? linkModal.office : userOffice,
				url: linkModal.url,
				pinned: linkModal.pinned,
				approved: true
			}, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.data.success) {
				// Refresh the links list
				const linksRes = await axios.get('http://localhost:5000/api/quicklinks');
				const mapped = linksRes.data.data.map(mapQuickLinkData);
				setArchiveItems(mapped);

				// Close modal and reset form
				setLinkModal({
					show: false,
					title: '',
					office: '',
					url: '',
					pinned: false
				});
			} else {
				alert('Failed to create link: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error creating link:', err);
			alert('Failed to create link: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to handle announcement edit
	const handleEditAnnouncement = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const formData = new FormData();

			formData.append('title', editAnnouncementModal.title);
			formData.append('office', editAnnouncementModal.office);
			formData.append('link', editAnnouncementModal.link);
			if (editAnnouncementModal.image) {
				formData.append('image', editAnnouncementModal.image);
			}

			const response = await axios.put(
				`http://localhost:5000/api/announcements/${editAnnouncementModal.id}`,
				formData,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'multipart/form-data'
					}
				}
			);

			if (response.data.success) {
				// Refresh the announcements list
				const announcementsRes = await axios.get('http://localhost:5000/api/announcements');
				const mapped = announcementsRes.data.data.map(mapAnnouncementData);
				setArchiveItems(mapped);

				// Close modal and reset form
				setEditAnnouncementModal({
					show: false,
					id: null,
					title: '',
					office: '',
					link: '',
					image: null
				});
			} else {
				alert('Failed to update announcement: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error updating announcement:', err);
			alert('Failed to update announcement: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to handle link edit
	const handleEditLink = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const response = await axios.put(
				`http://localhost:5000/api/quicklinks/${editLinkModal.id}`,
				{
					title: editLinkModal.title,
					office: editLinkModal.office,
					url: editLinkModal.url,
					pinned: editLinkModal.pinned
				},
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			if (response.data.success) {
				// Refresh the links list
				const linksRes = await axios.get('http://localhost:5000/api/quicklinks');
				const mapped = linksRes.data.data.map(mapQuickLinkData);
				setArchiveItems(mapped);

				// Close modal and reset form
				setEditLinkModal({
					show: false,
					id: null,
					title: '',
					office: '',
					url: '',
					pinned: true
				});
			} else {
				alert('Failed to update link: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error updating link:', err);
			alert('Failed to update link: ' + (err.response?.data?.error || err.message));
		}
	};

	return (
		<div className={`archive-container ${darkMode ? 'dark-mode' : ''}`}>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
			/>

			{/* Header Section */}
			<header className="archive-header">
				<h1 className="page-title">ARCHIVE</h1>
				<p className="page-subtitle">Browse and access all institutional resources</p>
			</header>

			{/* Add New Buttons - Fixed Position */}
			{(userRole === 'admin' || userRole === 'superadmin') && (
				<div className="add-new-container">
					<Link to={userRole === 'superadmin' ? '/superadmin/add-file' : '/admin/add-file'} className="add-new-button">
						<FaPlus /> Add New File
					</Link>
					<button
						className="add-new-button"
						onClick={() => setAnnouncementModal({ ...announcementModal, show: true })}
					>
						<FaPlus /> Add New Announcement
					</button>
					<button
						className="add-new-button"
						onClick={() => setLinkModal({ ...linkModal, show: true })}
					>
						<FaPlus /> Add New Link
					</button>
				</div>
			)}

			{/* Layout Toggle */}
			<div className="layout-toggle">
				<button
					className={layout === 'grid' ? 'active' : ''}
					onClick={() => setLayout('grid')}
					title="Grid View"
				>
					<FaTh />
				</button>
				<button
					className={layout === 'table' ? 'active' : ''}
					onClick={() => setLayout('table')}
					title="Table View"
				>
					<FaList />
				</button>
			</div>

			{/* Search and Filter Section */}
			<section className="archive-filters">
				<div className="search-container">
					<div className="search-bar">
						<input
							type="text"
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="filter-container">
						<div className="office-filter">
							<label htmlFor="office-filter">Office: </label>
							<select
								id="office-filter"
								value={selectedOffice}
								onChange={(e) => setSelectedOffice(e.target.value)}
							>
								<option value="All">All Offices</option>
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
					</div>
				</div>
			</section>

			{/* Category Tabs */}
			<nav className="category-tabs">
				<ul className="tab-list">
					{['All', 'Files', 'Announcements', 'Links'].map((tab) => (
						<li key={tab}>
							<button
								className={`tab-button ${activeTab === tab ? 'active' : ''}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab}
							</button>
						</li>
					))}
					{(userRole === 'admin' || userRole === 'superadmin') && (
						<li>
							<button
								className={`tab-button ${activeTab === 'Uploaded by Me' ? 'active' : ''}`}
								onClick={() => setActiveTab('Uploaded by Me')}
							>
								Uploaded by Me
							</button>
						</li>
					)}
				</ul>
			</nav>

			{/* Content Section */}
			<section className="archive-content">
				{loading ? (
					<div className="loading-state">
						<div className="loading-content">
							<div className="loading-dots">
								<div className="loading-dot"></div>
								<div className="loading-dot"></div>
								<div className="loading-dot"></div>
							</div>
							<p>Loading archive items...</p>
							{/* <p className="loading-subtext">Please wait while we fetch data</p> */}
						</div>
					</div>
				) : error ? (
					<div className="error-state">
						<p>{error}</p>
					</div>
				) : filteredItems.length === 0 ? (
					<div className="empty-state">
						<p>No items found matching your criteria</p>
					</div>
				) : layout === 'grid' ? (
					<div className="archive-grid">
						{filteredItems.map((item) => (
							<div key={item.id} className="archive-card">
								<div className="card-header">
									<h3 className="card-title">{item.fileName}</h3>
									<span className={`card-category ${item.category.toLowerCase()}`}>
										{item.category}
									</span>
								</div>

								<div className="card-content">
									<div className="card-info">
										<div className="info-row">
											<span className="info-label">Author:</span>
											<span className="info-value">{item.author}</span>
										</div>
										<div className="info-row">
											<span className="info-label">Office:</span>
											<span className="info-value">{item.office}</span>
										</div>
										<div className="info-row">
											<span className="info-label">Date:</span>
											<span className="info-value">{item.modifiedDate}</span>
										</div>
										{activeTab === 'Uploaded by Me' && (
											<div className="info-row">
												<span className="info-label">Status:</span>
												<span className={`status-badge ${item.status}`}>
													{item.status}
												</span>
											</div>
										)}
									</div>
								</div>

								<div className="card-actions">
									{item.category === 'Announcements' ? (
										<>
											{canManageItem(item.office) && (
												<button
													className="action-button edit"
													onClick={() => setEditAnnouncementModal({
														show: true,
														id: item.id,
														title: item.fileName,
														office: item.office,
														link: item.downloadUrl,
														image: item.image
													})}
												>
													Edit
												</button>
											)}
											<button
												className="action-button open-link"
												onClick={() => window.open(item.downloadUrl, '_blank')}
												disabled={!item.downloadUrl || item.downloadUrl === '#'}
											>
												Open Link
											</button>
										</>
									) : item.category === 'Links' ? (
										<>
											{canManageItem(item.office) && (
												<>
													{/* {item.status === 'approved' && (
														<button
															className="action-button pin"
															onClick={() => {
																const endpoint = item.pinned ? 'unpin' : 'pin';
																axios.put(
																	`http://localhost:5000/api/quicklinks/${item.id}/${endpoint}`,
																	{},
																	{
																		headers: {
																			'Authorization': `Bearer ${localStorage.getItem('token')}`
																		}
																	}
																).then(() => {
																	// Refresh the links list
																	axios.get('http://localhost:5000/api/quicklinks')
																		.then(res => {
																			const mapped = res.data.data.map(mapQuickLinkData);
																			setArchiveItems(mapped);
																		});
																});
															}}
														>
															{item.pinned ? 'Unpin' : 'Pin'}
														</button>
													)} */}
													<button
														className="action-button edit"
														onClick={() => setEditLinkModal({
															show: true,
															id: item.id,
															title: item.fileName,
															office: item.office,
															url: item.downloadUrl,
															pinned: item.pinned
														})}
													>
														Edit
													</button>
												</>
											)}
											<button
												className="action-button open-link"
												onClick={() => window.open(item.downloadUrl, '_blank')}
												disabled={!item.downloadUrl || item.downloadUrl === '#'}
											>
												Open Link
											</button>
										</>
									) : (
										<>
											{item.downloadUrl && !item.viewURL ? (
												<a
													href={item.downloadUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="action-button preview"
												>
													Preview
												</a>
											) : (
												<>
													{item.viewURL && (
														<button
															className='action-button preview'
															onClick={() => {
																console.log("Preview viewURL: ", item.viewURL);
																window.open(item.viewURL, "_blank")
															}}
														>
															Preview
														</button>
													)}
													{item.downloadUrl && (
														<a
															href={item.downloadUrl}
															target='_blank'
															rel='noopener noreferrer'
															className='action-button download'
														>
															Download
														</a>
													)}
												</>
											)}
										</>
									)}
									{canManageItem(item.office) && (
										<button
											className="action-button delete"
											onClick={() => setDeleteModal({
												show: true,
												itemId: item.id,
												itemName: item.fileName,
												category: item.category
											})}
										>
											<FaTrash />
										</button>
									)}
								</div>

								{activeTab === 'Uploaded by Me' && item.status === 'rejected' && (
									<div className="comments-section">
										<button
											className="comments-toggle"
											onClick={() => toggleComments(item.id)}
										>
											View Rejection Comments
										</button>
										{expandedFileId === item.id && (
											<div className="comments-content">
												{item.comments && item.comments.length > 0 ? (
													item.comments.map((comment, index) => (
														<div key={index} className="comment-item">
															<div className="comment-header">
																<span className="comment-author">
																	{comment.author?.name || 'Unknown'}
																</span>
																<span className="comment-date">
																	{new Date(comment.createdAt).toLocaleDateString()}
																</span>
															</div>
															<p className="comment-text">{comment.content}</p>
														</div>
													))
												) : (
													<p className="no-comments">No comments available</p>
												)}
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<table className="archive-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Category</th>
								<th>Author</th>
								<th>Office</th>
								<th>Date</th>
								{activeTab === 'Uploaded by Me' && <th>Status</th>}
								<th className="actions-cell">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredItems.map((item) => (
								<tr key={item.id}>
									<td className="name-cell">{item.fileName}</td>
									<td className="category-cell">
										<span className={`category-badge ${item.category.toLowerCase()}`}>
											{item.category}
										</span>
									</td>
									<td className="author-cell">{item.author}</td>
									<td className="office-cell">{item.office}</td>
									<td className="date-cell">{item.modifiedDate}</td>
									{activeTab === 'Uploaded by Me' && (
										<td className="status-cell">
											<div className="status-container">
												<span className={`status-badge ${item.status?.toLowerCase()}`}>
													{item.status}
												</span>
												{item.status?.toLowerCase() === 'rejected' && item.comments && (
													<button
														className="comments-toggle"
														onClick={() => toggleComments(item.id)}
													>
														View Comments
													</button>
												)}
											</div>
											{expandedFileId === item.id && item.comments && (
												<div className="comments-content">
													{item.comments.map((comment, index) => (
														<div key={index} className="comment-item">
															<div className="comment-header">
																<span className="comment-author">
																	{comment.author?.name || 'Unknown'}
																</span>
																<span className="comment-date">
																	{new Date(comment.createdAt).toLocaleDateString()}
																</span>
															</div>
															<p className="comment-text">{comment.content}</p>
														</div>
													))}
												</div>
											)}
										</td>
									)}
									<td className="actions-cell">
										<div className="card-actions">
											{item.category === 'Announcements' ? (
												<>
													{canManageItem(item.office) && (
														<button
															className="action-button edit"
															onClick={() => setEditAnnouncementModal({
																show: true,
																id: item.id,
																title: item.fileName,
																office: item.office,
																link: item.downloadUrl,
																image: item.image
															})}
														>
															Edit
														</button>
													)}
													<button
														className="action-button open-link"
														onClick={() => window.open(item.downloadUrl, '_blank')}
														disabled={!item.downloadUrl || item.downloadUrl === '#'}
													>
														Open Link
													</button>
												</>
											) : item.category === 'Links' ? (
												<>
													{canManageItem(item.office) && (
														<>
															{item.status === 'approved' && (
																<button
																	className="action-button pin"
																	onClick={() => {
																		const endpoint = item.pinned ? 'unpin' : 'pin';
																		axios.put(
																			`http://localhost:5000/api/quicklinks/${item.id}/${endpoint}`,
																			{},
																			{
																				headers: {
																					'Authorization': `Bearer ${localStorage.getItem('token')}`
																				}
																			}
																		).then(() => {
																			// Refresh the links list
																			axios.get('http://localhost:5000/api/quicklinks')
																				.then(res => {
																					const mapped = res.data.data.map(mapQuickLinkData);
																					setArchiveItems(mapped);
																				});
																		});
																	}}
																>
																	{item.pinned ? 'Unpin' : 'Pin'}
																</button>
															)}
															<button
																className="action-button edit"
																onClick={() => setEditLinkModal({
																	show: true,
																	id: item.id,
																	title: item.fileName,
																	office: item.office,
																	url: item.downloadUrl,
																	pinned: item.pinned
																})}
															>
																Edit
															</button>
														</>
													)}
													<button
														className="action-button open-link"
														onClick={() => window.open(item.downloadUrl, '_blank')}
														disabled={!item.downloadUrl || item.downloadUrl === '#'}
													>
														Open Link
													</button>
												</>
											) : (
												<>
													<button
														className="action-button preview"
														onClick={() => window.open(item.viewURL, '_blank')}
													>
														Preview
													</button>
													<a
														href={item.downloadUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="action-button download"
													>
														Download
													</a>
												</>
											)}
											{canManageItem(item.office) && (
												<button
													className="action-button delete"
													onClick={() => setDeleteModal({
														show: true,
														itemId: item.id,
														itemName: item.fileName,
														category: item.category
													})}
												>
													<FaTrash />
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</section>

			{/* Delete Confirmation Modal */}
			{deleteModal.show && (
				<div className="modal-overlay">
					<div className="delete-modal">
						<div className="modal-header">
							<h3>Confirm Deletion</h3>
							<button
								className="close-button"
								onClick={() => setDeleteModal({ show: false, itemId: null, itemName: '', category: '' })}
							>
								×
							</button>
						</div>
						<div className="modal-content">
							<p>Are you sure you want to delete "{deleteModal.itemName}"?</p>
							<p className="warning-text">This action cannot be undone.</p>
						</div>
						<div className="modal-actions">
							<button
								className="cancel-button"
								onClick={() => setDeleteModal({ show: false, itemId: null, itemName: '', category: '' })}
							>
								Cancel
							</button>
							<button
								className="delete-confirm-button"
								onClick={() => handleDelete(deleteModal.itemId, deleteModal.category)}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Announcement Creation Modal */}
			{announcementModal.show && (
				<div className="modal-overlay">
					<div className="announcement-modal">
						<div className="modal-header">
							<h3>Create New Announcement</h3>
							<button
								className="close-button"
								onClick={() => setAnnouncementModal({ ...announcementModal, show: false })}
							>
								×
							</button>
						</div>
						<form onSubmit={handleCreateAnnouncement} className="modal-content">
							<div className="form-group">
								<label htmlFor="title">Title</label>
								<input
									type="text"
									id="title"
									value={announcementModal.title}
									onChange={(e) => setAnnouncementModal({ ...announcementModal, title: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="office">Office</label>
								{userRole === "superadmin" && (
									<>
										<select
											id="office"
											value={announcementModal.office}
											onChange={(e) => setAnnouncementModal({ ...announcementModal, office: e.target.value })}
											required
										>
											<option value="">Select Office</option>
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
									</>
								)}
								{userRole === "admin" && (
									<>
										<input value={userOffice} disabled></input>
									</>
								)}

							</div>
							<div className="form-group">
								<label htmlFor="link">Link (Optional)</label>
								<input
									type="url"
									id="link"
									value={announcementModal.link}
									onChange={(e) => setAnnouncementModal({ ...announcementModal, link: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="image">Image (Optional)</label>
								<input
									type="file"
									id="image"
									accept="image/*"
									onChange={handleFileChange}
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="cancel-button"
									onClick={() => setAnnouncementModal({ ...announcementModal, show: false })}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="submit-button"
								>
									Create Announcement
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Link Creation Modal */}
			{linkModal.show && (
				<div className="modal-overlay">
					<div className="link-modal">
						<div className="modal-header">
							<h3>Create New Link</h3>
							<button
								className="close-button"
								onClick={() => setLinkModal({ ...linkModal, show: false })}
							>
								×
							</button>
						</div>
						<form onSubmit={handleCreateLink} className="modal-content">
							<div className="form-group">
								<label htmlFor="title">Title</label>
								<input
									type="text"
									id="title"
									value={linkModal.title}
									onChange={(e) => setLinkModal({ ...linkModal, title: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="office">Office</label>
								{userRole === "superadmin" && (
									<>
										<select
											id="office"
											value={linkModal.office}
											onChange={(e) => setLinkModal({ ...linkModal, office: e.target.value })}
											required
										>
											<option value="">Select Office</option>
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
									</>
								)}

								{userRole === "admin" && (
									<>
										<input value={userOffice} disabled></input>
									</>
								)}
								

							</div>
							<div className="form-group">
								<label htmlFor="url">URL</label>
								<input
									type="url"
									id="url"
									value={linkModal.url}
									onChange={(e) => setLinkModal({ ...linkModal, url: e.target.value })}
									required
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="cancel-button"
									onClick={() => setLinkModal({ ...linkModal, show: false })}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="submit-button"
								>
									Create Link
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Announcement Modal */}
			{editAnnouncementModal.show && (
				<div className="modal-overlay">
					<div className="announcement-modal">
						<div className="modal-header">
							<h3>Edit Announcement</h3>
							<button
								className="close-button"
								onClick={() => setEditAnnouncementModal({ ...editAnnouncementModal, show: false })}
							>
								×
							</button>
						</div>
						<form onSubmit={handleEditAnnouncement} className="modal-content">
							<div className="form-group">
								<label htmlFor="edit-title">Title</label>
								<input
									type="text"
									id="edit-title"
									value={editAnnouncementModal.title}
									onChange={(e) => setEditAnnouncementModal({ ...editAnnouncementModal, title: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-office">Office</label>
								<select
									id="edit-office"
									value={editAnnouncementModal.office}
									onChange={(e) => setEditAnnouncementModal({ ...editAnnouncementModal, office: e.target.value })}
									required
								>
									<option value="">Select Office</option>
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
							<div className="form-group">
								<label htmlFor="edit-link">Link</label>
								<input
									type="url"
									id="edit-link"
									value={editAnnouncementModal.link}
									onChange={(e) => setEditAnnouncementModal({ ...editAnnouncementModal, link: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-image">Image (Optional)</label>
								<input
									type="file"
									id="edit-image"
									accept="image/*"
									onChange={(e) => {
										if (e.target.files && e.target.files[0]) {
											setEditAnnouncementModal({
												...editAnnouncementModal,
												image: e.target.files[0]
											});
										}
									}}
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="cancel-button"
									onClick={() => setEditAnnouncementModal({ ...editAnnouncementModal, show: false })}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="submit-button"
								>
									Update Announcement
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Link Modal */}
			{editLinkModal.show && (
				<div className="modal-overlay">
					<div className="link-modal">
						<div className="modal-header">
							<h3>Edit Link</h3>
							<button
								className="close-button"
								onClick={() => setEditLinkModal({ ...editLinkModal, show: false })}
							>
								×
							</button>
						</div>
						<form onSubmit={handleEditLink} className="modal-content">
							<div className="form-group">
								<label htmlFor="edit-title">Title</label>
								<input
									type="text"
									id="edit-title"
									value={editLinkModal.title}
									onChange={(e) => setEditLinkModal({ ...editLinkModal, title: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-office">Office</label>
								<select
									id="edit-office"
									value={editLinkModal.office}
									onChange={(e) => setEditLinkModal({ ...editLinkModal, office: e.target.value })}
									required
								>
									<option value="">Select Office</option>
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
							<div className="form-group">
								<label htmlFor="edit-url">URL</label>
								<input
									type="url"
									id="edit-url"
									value={editLinkModal.url}
									onChange={(e) => setEditLinkModal({ ...editLinkModal, url: e.target.value })}
									required
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="cancel-button"
									onClick={() => setEditLinkModal({ ...editLinkModal, show: false })}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="submit-button"
								>
									Update Link
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Archive;
