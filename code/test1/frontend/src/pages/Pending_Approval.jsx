import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css';
import '../css/pending_approval.css';

function PendingApprovals({ darkMode }) {
	const [pendingItems, setPendingItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
					url: file.url
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
			
			// Remove the approved file from the list
			setPendingItems(prevItems => prevItems.filter(item => item.id !== id));
		} catch (err) {
			console.error('Error approving file:', err);
			alert('Failed to approve file');
		}
	};

	// Function to reject a file
	const rejectItem = async (id) => {
		const comment = prompt('Please enter a reason for rejection:');
		if (!comment) return;

		try {
			const token = localStorage.getItem('token');
			const response = await axios.put(`http://localhost:5000/api/files/${id}/reject`, { comment }, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			
			if (response.data.success) {
				// Remove the rejected file from the list
				setPendingItems(prevItems => prevItems.filter(item => item.id !== id));
				alert('File rejected successfully');
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
		if (item.url) {
			window.open(item.url, '_blank');
		} else if (item.filePath) {
			window.open(`http://localhost:5000${item.filePath}`, '_blank');
		} else {
			alert('No preview available for this file');
		}
	};

	// Approve All button handler
	const approveAll = async () => {
		try {
			const token = localStorage.getItem('token');
			// Approve each file one by one
			for (const item of pendingItems) {
				await axios.put(`http://localhost:5000/api/files/${item.id}/approve`, {}, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
			}
			
			// Clear all items after approval
			setPendingItems([]);
		} catch (err) {
			console.error('Error approving all files:', err);
			alert('Failed to approve all files');
		}
	};

	if (loading) {
		return <div className="loading">Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<div className={`pending-approvals-container ${darkMode ? 'dark-mode' : ''}`}>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
			/>
			<h1 className="page-title">PENDING APPROVALS</h1>
			
			{/* Table Section */}
			<section className="pending-table">
				{/* Table Header */}
				<div className="table-header">
					<div className="header-row">
						<div className="file-name-col">FILE NAME</div>
						<div className="table-divider">|</div>
						<div className="author-col">AUTHOR NAME</div>
						<div className="table-divider">|</div>
						<div className="office-col">OFFICE NAME</div>
						<div className="table-divider">|</div>
						<div className="date-col">UPLOAD DATE</div>
						<div className="table-divider">|</div>
						<div className="preview-col">PREVIEW</div>
						<div className="table-divider">|</div>
						<div className="action-col">ACTION</div>
					</div>
				</div>

				{/* Table Rows */}
				<div className="table-rows">
					{pendingItems.map((item) => (
						<article key={item.id} className="table-row">
							<div className="file-name">{item.fileName}</div>
							<div className="table-divider">|</div>
							<div className="author">{item.author}</div>
							<div className="table-divider">|</div>
							<div className="office">{item.office}</div>
							<div className="table-divider">|</div>
							<div className="upload-date">{item.uploadDate}</div>
							<div className="table-divider">|</div>
							<div className="preview">
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										previewItem(item);
									}}
									title="Preview"
									className="preview-link"
								>
									Preview
								</a>
							</div>
							<div className="table-divider">|</div>
							<div className="actions">
								<button
									type="button"
									className="approve-btn"
									onClick={() => approveItem(item.id)}
									title="Approve"
								>
									✓
								</button>
								<button
									type="button"
									className="reject-btn"
									onClick={() => rejectItem(item.id)}
									title="Reject"
								>
									✗
								</button>
							</div>
						</article>
					))}
					{pendingItems.length === 0 && (
						<p className="no-results">No pending items found.</p>
					)}
				</div>
			</section>

			{/* Approve All Button */}
			{pendingItems.length > 0 && (
				<button type="button" className="approve-all-btn" onClick={approveAll}>
					APPROVE ALL
				</button>
			)}
			<div style={{ height: '27vh' }}></div>
		</div>
	);
}

export default PendingApprovals;
