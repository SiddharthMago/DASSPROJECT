import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css';
import '../css/pending_approval.css';

function PendingApprovals({ darkMode }) {
	const [pendingFiles, setPendingFiles] = useState([]);
	const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
	const [pendingQuickLinks, setPendingQuickLinks] = useState([]);
	const [pendingPortals, setPendingPortals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [rejectModal, setRejectModal] = useState({ show: false, itemId: null, reason: '', type: '' });

	// Fetch pending items from the backend
	useEffect(() => {
		const fetchPendingItems = async () => {
			try {
				const token = localStorage.getItem('token');
				
				// Fetch pending files
				const filesResponse = await axios.get('http://localhost:5000/api/files/pending', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				
				const mappedFiles = filesResponse.data.data.map(file => ({
					id: file._id,
					fileName: file.name,
					author: file.author?.name || 'Unknown Author',
					office: file.office,
					uploadDate: new Date(file.createdAt).toLocaleDateString(),
					filePath: file.filePath,
					url: file.url,
					category: 'file'
				}));
				
				// Fetch pending announcements
				const announcementsResponse = await axios.get('http://localhost:5000/api/announcements/unapproved', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const mappedAnnouncements = announcementsResponse.data.data.map(announcement => ({
					id: announcement._id,
					fileName: announcement.title,
					author: announcement.author?.name || 'Unknown Author',
					office: announcement.office,
					uploadDate: new Date(announcement.createdAt).toLocaleDateString(),
					link: announcement.link,
					image: announcement.image,
					category: 'announcement'
				}));
				
				// Fetch pending quick links
				const quickLinksResponse = await axios.get('http://localhost:5000/api/quicklinks/unapproved', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const mappedQuickLinks = quickLinksResponse.data.data.map(quickLink => ({
					id: quickLink._id,
					fileName: quickLink.title,
					author: quickLink.author?.name || 'Unknown Author',
					office: quickLink.office,
					uploadDate: new Date(quickLink.createdAt).toLocaleDateString(),
					url: quickLink.url,
					category: 'quicklink'
				}));

				const portalsResponse = await axios.get('http://localhost:5000/api/portals/unapproved',
					{ headers: { Authorization:`Bearer ${token}` } }
				);
				const mappedPortals = portalsResponse.data.data.map(p=>({
					id: p._id,
					fileName: p.title,
					author: p.author?.name || 'Unknown Author',
					office: p.office || '—',
					createdAt: p.createdAt,
					uploadDate: new Date(p.createdAt).toLocaleDateString(),
					category: 'portal'	
				}));
				
				setPendingFiles(mappedFiles);
				setPendingAnnouncements(mappedAnnouncements);
				setPendingQuickLinks(mappedQuickLinks);
				setPendingPortals(mappedPortals);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching pending items:', err);
				setError('Failed to fetch pending items');
				setLoading(false);
			}
		};

		fetchPendingItems();
	}, []);

	// Function to approve an item
	const approveItem = async (id, type) => {
		try {
			const token = localStorage.getItem('token');
			const endpoint = type === 'file' ? 'files' : type === 'announcement' ? 'announcements' : type === 'quicklink' ? 'quicklinks' : 'portals';
			await axios.put(`http://localhost:5000/api/${endpoint}/${id}/approve`, {}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			
			if (type === 'file') {
				setPendingFiles(prevItems => prevItems.filter(item => item.id !== id));
			} else if (type === 'announcement') {
				setPendingAnnouncements(prevItems => prevItems.filter(item => item.id !== id));
			} else if (type === 'quicklink') {
				setPendingQuickLinks(prevItems => prevItems.filter(item => item.id !== id));
			} else if (type === 'portal') {
				setPendingPortals(prevItems => prevItems.filter(item => item.id !== id));
			}
		} catch (err) {
			console.error('Error approving item:', err);
			alert('Failed to approve item');
		}
	};

	// Function to reject an item
	const rejectItem = async (id, type) => {
		setRejectModal({ show: true, itemId: id, reason: '', type });
	};

	const handleRejectConfirm = async () => {
		if (!rejectModal.reason.trim()) {
			alert('Please provide a reason for rejection');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const endpoint = rejectModal.type === 'file' ? 'files' : rejectModal.type === 'announcement' ? 'announcements' : rejectModal.type === 'quicklink' ? 'quicklinks' : 'portals';
			const response = await axios.put(`http://localhost:5000/api/${endpoint}/${rejectModal.itemId}/reject`, 
				{ comment: rejectModal.reason }, 
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			
			if (response.data.success) {
				if (rejectModal.type === 'file') {
					setPendingFiles(prevItems => prevItems.filter(item => item.id !== rejectModal.itemId));
				} else if (rejectModal.type === 'announcement') {
					setPendingAnnouncements(prevItems => prevItems.filter(item => item.id !== rejectModal.itemId));
				} else if (rejectModal.type === 'quicklink') {
					setPendingQuickLinks(prevItems => prevItems.filter(item => item.id !== rejectModal.itemId));
				} else if (rejectModal.type === 'portal') {
					setPendingPortals(prevItems => prevItems.filter(item => item.id !== rejectModal.itemId));
				}
				setRejectModal({ show: false, itemId: null, reason: '', type: '' });
			} else {
				alert('Failed to reject item: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error rejecting item:', err);
			alert('Failed to reject item: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to preview an item
	const previewItem = (item) => {
		if (item.category === 'file') {
			// Build the view URL using the file ID for the file view route
			const role = localStorage.getItem('role') || 'superadmin';
			const viewURL = `/${role}/file/${item.id}`;
			
			if (item.filePath || item.url) {
				window.open(viewURL, '_blank');
			} else {
				alert('No preview available for this file');
			}
		} else if (item.category === 'announcement') {
			// For announcements, open the link if available
			if (item.link) {
				window.open(item.link, '_blank');
			} else {
				alert('No preview available for this announcement');
			}
		} else {
			// For quick links and portals, open the URL
			if (item.url) {
				window.open(item.url, '_blank');
			} else {
				alert('No preview available for this quick link');
			}
		}
	};

	// Approve All button handler
	const approveAll = async (type) => {
		try {
			const token = localStorage.getItem('token');
			const items = type === 'file' ? pendingFiles : type === 'announcement' ? pendingAnnouncements : pendingQuickLinks;
			const endpoint = type === 'file' ? 'files' : type === 'announcement' ? 'announcements' : type === 'quicklink' ? 'quicklinks' : 'portals';
			
			for (const item of items) {
				await axios.put(`http://localhost:5000/api/${endpoint}/${item.id}/approve`, {}, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
			}
			
			if (type === 'file') {
				setPendingFiles([]);
			} else if (type === 'announcement') {
				setPendingAnnouncements([]);
			} else {
				setPendingQuickLinks([]);
			}
		} catch (err) {
			console.error('Error approving all items:', err);
			alert('Failed to approve all items');
		}
	};

	// Filter items based on search query
	const filteredFiles = pendingFiles.filter(item => {
		return item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   item.author.toLowerCase().includes(searchQuery.toLowerCase());
	});

	const filteredAnnouncements = pendingAnnouncements.filter(item => {
		return item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   item.author.toLowerCase().includes(searchQuery.toLowerCase());
	});

	const filteredQuickLinks = pendingQuickLinks.filter(item => {
		return item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   item.author.toLowerCase().includes(searchQuery.toLowerCase());
	});

	const filteredPortals    = pendingPortals.filter(item => {
		return item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   item.author  .toLowerCase().includes(searchQuery.toLowerCase())
	});

	if (loading) {
		return <div className="loading">Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<div className={`pending-approvals-container ${darkMode ? 'dark-mode' : ''}`}>
			<div className="archive-header">
				<h1 className="page-title">PENDING APPROVALS</h1>
				<p className="page-subtitle">Review and approve pending submissions</p>
			</div>

			<div className="archive-filters">
				<div className="search-container">
					<div className="search-bar">
						<input
							type="text"
							placeholder="Search by name or author..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Files Section */}
			<div className="archive-content">
				<h2 className="section-title">Pending Files</h2>
				{filteredFiles.length === 0 ? (
					<div className="empty-state">
						No pending files found.
					</div>
				) : (
					<table className="archive-table">
						<thead>
							<tr>
								<th className="name-cell">Name</th>
								<th className="author-cell">Author</th>
								<th className="office-cell">Office</th>
								<th className="date-cell">Date</th>
								<th className="actions-cell">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredFiles.map((item) => (
								<tr key={item.id}>
									<td className="name-cell">{item.fileName}</td>
									<td className="author-cell">{item.author}</td>
									<td className="office-cell">{item.office}</td>
									<td className="date-cell">{item.uploadDate}</td>
									<td className="actions-cell">
										<div className="card-actions">
											<button
												className="action-button preview"
												onClick={() => previewItem(item)}
											>
												Preview
											</button>
											<button
												className="action-button approve"
												onClick={() => approveItem(item.id, 'file')}
											>
												Approve
											</button>
											<button
												className="action-button reject"
												onClick={() => rejectItem(item.id, 'file')}
											>
												Reject
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{filteredFiles.length > 0 && (
					<button className="approve-all-btn" onClick={() => approveAll('file')}>
						APPROVE ALL FILES
					</button>
				)}
			</div>

			{/* Announcements Section */}
			<div className="archive-content">
				<h2 className="section-title">Pending Announcements</h2>
				{filteredAnnouncements.length === 0 ? (
					<div className="empty-state">
						No pending announcements found.
					</div>
				) : (
					<table className="archive-table">
						<thead>
							<tr>
								<th className="name-cell">Title</th>
								<th className="author-cell">Author</th>
								<th className="office-cell">Office</th>
								<th className="date-cell">Date</th>
								<th className="actions-cell">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredAnnouncements.map((item) => (
								<tr key={item.id}>
									<td className="name-cell">{item.fileName}</td>
									<td className="author-cell">{item.author}</td>
									<td className="office-cell">{item.office}</td>
									<td className="date-cell">{item.uploadDate}</td>
									<td className="actions-cell">
										<div className="card-actions">
											<button
												className="action-button preview"
												onClick={() => previewItem(item)}
											>
												Link
											</button>
											<button
												className="action-button approve"
												onClick={() => approveItem(item.id, 'announcement')}
											>
												Approve
											</button>
											<button
												className="action-button reject"
												onClick={() => rejectItem(item.id, 'announcement')}
											>
												Reject
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{filteredAnnouncements.length > 0 && (
					<button className="approve-all-btn" onClick={() => approveAll('announcement')}>
						APPROVE ALL ANNOUNCEMENTS
					</button>
				)}
			</div>

			{/* Quick Links Section */}
			<div className="archive-content">
				<h2 className="section-title">Pending Quick Links</h2>
				{filteredQuickLinks.length === 0 ? (
					<div className="empty-state">
						No pending quick links found.
					</div>
				) : (
					<table className="archive-table">
						<thead>
							<tr>
								<th className="name-cell">Title</th>
								<th className="author-cell">Author</th>
								<th className="office-cell">Office</th>
								<th className="date-cell">Date</th>
								<th className="actions-cell">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredQuickLinks.map((item) => (
								<tr key={item.id}>
									<td className="name-cell">{item.fileName}</td>
									<td className="author-cell">{item.author}</td>
									<td className="office-cell">{item.office}</td>
									<td className="date-cell">{item.uploadDate}</td>
									<td className="actions-cell">
										<div className="card-actions">
											<button
												className="action-button preview"
												onClick={() => previewItem(item)}
											>
												Link
											</button>
											<button
												className="action-button approve"
												onClick={() => approveItem(item.id, 'quicklink')}
											>
												Approve
											</button>
											<button
												className="action-button reject"
												onClick={() => rejectItem(item.id, 'quicklink')}
											>
												Reject
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{filteredQuickLinks.length > 0 && (
					<button className="approve-all-btn" onClick={() => approveAll('quicklink')}>
						APPROVE ALL QUICK LINKS
					</button>
				)}
			</div>

			{/* Portals Section */}
			<div className="archive-content">
				<h2 className="section-title">Pending Portals</h2>
				{filteredPortals.length === 0 ? (
					<div className="empty-state">
						No pending portals found.
					</div>
				) : (
					<table className="archive-table">
						<thead>
							<tr>
								<th className="name-cell">Title</th>
								<th className="author-cell">Author</th>
								<th className="office-cell">Office</th>
								<th className="date-cell">Date</th>
								<th className="actions-cell">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredPortals.map((item) => (
								<tr key={item.id}>
									<td className="name-cell">{item.fileName}</td>
									<td className="author-cell">{item.author}</td>
									<td className="office-cell">{item.office}</td>
									<td className="date-cell">{item.uploadDate}</td>
									<td className="actions-cell">
										<div className="card-actions">
											<button
												className="action-button preview"
												onClick={() => previewItem(item)}
											>
												Link
											</button>
											<button
												className="action-button approve"
												onClick={() => approveItem(item.id, 'portal')}
											>
												Approve
											</button>
											<button
												className="action-button reject"
												onClick={() => rejectItem(item.id, 'portal')}
											>
												Reject
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{filteredPortals.length > 0 && (
					<button className="approve-all-btn" onClick={() => approveAll('portal')}>
						APPROVE ALL PORTALS
					</button>
				)}
			</div>

			{/* Reject Modal */}
			{rejectModal.show && (
				<div className="modal-overlay">
					<div className="reject-modal">
						<div className="modal-header">
							<h3>Reject {rejectModal.type === 'file' ? 'files' : rejectModal.type === 'announcement' ? 'announcements': rejectModal.type === 'quicklink' ? 'quicklinks' : 'portals'}</h3>
							<button 
								className="close-button"
								onClick={() => setRejectModal({ show: false, itemId: null, reason: '', type: '' })}
							>
								×
							</button>
						</div>
						<div className="modal-content">
							<p>Please provide a reason for rejecting this {rejectModal.type}:</p>
							<textarea
								value={rejectModal.reason}
								onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
								placeholder="Enter rejection reason..."
								rows="4"
							/>
						</div>
						<div className="modal-actions">
							<button 
								className="cancel-button"
								onClick={() => setRejectModal({ show: false, itemId: null, reason: '', type: '' })}
							>
								Cancel
							</button>
							<button 
								className="reject-confirm-button"
								onClick={handleRejectConfirm}
							>
								Confirm Rejection
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default PendingApprovals;
