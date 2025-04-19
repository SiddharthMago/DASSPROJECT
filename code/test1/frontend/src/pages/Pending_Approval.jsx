import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css';
import '../css/pending_approval.css';

function PendingApprovals({ darkMode }) {
	const [pendingItems, setPendingItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [rejectModal, setRejectModal] = useState({ show: false, itemId: null, reason: '' });

	// Fetch pending files from the backend
	useEffect(() => {
		const fetchPendingFiles = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get('http://localhost:5000/api/files/pending', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				
				const mappedFiles = response.data.data.map(file => ({
					id: file._id,
					fileName: file.name,
					author: file.author.name,
					office: file.office,
					uploadDate: new Date(file.createdAt).toLocaleDateString(),
					filePath: file.filePath,
					url: file.url,
					category: 'file'
				}));
				
				setPendingItems(mappedFiles);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching pending files:', err);
				setError('Failed to fetch pending files');
				setLoading(false);
			}
		};

		fetchPendingFiles();
	}, []);

	// Function to approve a file
	const approveItem = async (id) => {
		try {
			const token = localStorage.getItem('token');
			await axios.put(`http://localhost:5000/api/files/${id}/approve`, {}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			
			setPendingItems(prevItems => prevItems.filter(item => item.id !== id));
		} catch (err) {
			console.error('Error approving file:', err);
			alert('Failed to approve file');
		}
	};

	// Function to reject a file
	const rejectItem = async (id) => {
		setRejectModal({ show: true, itemId: id, reason: '' });
	};

	const handleRejectConfirm = async () => {
		if (!rejectModal.reason.trim()) {
			alert('Please provide a reason for rejection');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await axios.put(`http://localhost:5000/api/files/${rejectModal.itemId}/reject`, 
				{ comment: rejectModal.reason }, 
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			
			if (response.data.success) {
				setPendingItems(prevItems => prevItems.filter(item => item.id !== rejectModal.itemId));
				setRejectModal({ show: false, itemId: null, reason: '' });
			} else {
				alert('Failed to reject file: ' + response.data.error);
			}
		} catch (err) {
			console.error('Error rejecting file:', err);
			alert('Failed to reject file: ' + (err.response?.data?.error || err.message));
		}
	};

	// Function to preview a file
	const previewItem = (item) => {
		const filePath = item.filePath ? `/${item.filePath.replace(/\\/g, "/")}` : '';
		const viewURL = filePath ? `http://localhost:5000${filePath}` : null;
		if (item.url) {
			window.open(viewURL, '_blank');
		} else {
			alert('No preview available for this file');
		}
	};

	// Approve All button handler
	const approveAll = async () => {
		try {
			const token = localStorage.getItem('token');
			for (const item of pendingItems) {
				await axios.put(`http://localhost:5000/api/files/${item.id}/approve`, {}, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
			}
			
			setPendingItems([]);
		} catch (err) {
			console.error('Error approving all files:', err);
			alert('Failed to approve all files');
		}
	};

	// Filter items based on search query
	const filteredItems = pendingItems.filter(item => {
		return item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			   item.author.toLowerCase().includes(searchQuery.toLowerCase());
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

			<div className="archive-content">
				{filteredItems.length === 0 ? (
					<div className="empty-state">
						No pending items found.
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
							{filteredItems.map((item) => (
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
												onClick={() => approveItem(item.id)}
											>
												Approve
											</button>
											<button
												className="action-button reject"
												onClick={() => rejectItem(item.id)}
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
			</div>

			{filteredItems.length > 0 && (
				<button className="approve-all-btn" onClick={approveAll}>
					APPROVE ALL
				</button>
			)}

			{/* Reject Modal */}
			{rejectModal.show && (
				<div className="modal-overlay">
					<div className="reject-modal">
						<div className="modal-header">
							<h3>Reject File</h3>
							<button 
								className="close-button"
								onClick={() => setRejectModal({ show: false, itemId: null, reason: '' })}
							>
								×
							</button>
						</div>
						<div className="modal-content">
							<p>Please provide a reason for rejecting this file:</p>
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
								onClick={() => setRejectModal({ show: false, itemId: null, reason: '' })}
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
