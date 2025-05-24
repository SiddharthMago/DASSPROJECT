const File = require('../models/Files');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../uploads/files'));
	},
	filename: (req, file, cb) => {
		// Replace spaces with underscores in the original filename
		const sanitizedName = file.originalname.replace(/\s+/g, '_');
		cb(null, `${Date.now()}-${sanitizedName}`);
	},
});

const upload = multer({ storage });

module.exports.upload = upload;

exports.addFile = async (req, res, next) => {
	try {
		const { name, office, category, url } = req.body;

		// Check if either a file or URL is provided
		if (!req.file && !url) {
			return next(new ErrorResponse(`Please upload a file or provide a URL`, 400));
		}

		if (!name || !office || !category) {
			return next(new ErrorResponse(`Please provide all required fields`, 400));
		}

		// Create file document with the provided data
		const fileData = {
			name,
			office,
			category,
			author: req.user.id // Use the authenticated user's ID
		};

		// If a file was uploaded, add its path
		if (req.file) {
			// Store relative path instead of absolute path
			fileData.filePath = `uploads/files/${req.file.filename}`;
			fileData.url = null; // Clear URL if a file is uploaded
		}

		// If URL was provided, add it
		if (url) {
			fileData.url = url;
		}

		const file = await File.create(fileData);

		res.status(200).json({
			success: true,
			data: file
		});
	} catch (err) {
		next(err);
	}
};

// @desc    Delete a file
exports.deleteFile = async (req, res, next) => {
	console.log(`[DELETE FILE] Request to delete file: ${req.params.id}`);

	try {
		const file = await File.findById(req.params.id);
		if (!file) {
			console.warn(`[DELETE FILE] File not found: ${req.params.id}`);
			return res.status(404).json({ success: false, error: 'File not found' });
		}

    if (file.filePath) {
      // Construct absolute path from relative path
      const filePath = path.join(__dirname, '..', file.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[DELETE FILE] File deleted from disk: ${filePath}`);
      }
    }

		// Replace .remove() with .findByIdAndDelete()
		await File.findByIdAndDelete(req.params.id);

		console.log(`[DELETE FILE] File record deleted from DB: ${req.params.id}`);
		res.status(200).json({ success: true, message: 'File deleted successfully' });
	} catch (err) {
		console.error(`[DELETE FILE] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Approve a file
exports.approveFile = async (req, res, next) => {
	console.log(`[APPROVE FILE] Request to approve file: ${req.params.id} by ${req.user?.id}`);

	try {
		const file = await File.findByIdAndUpdate(
		req.params.id,
		{ status: 'approved' },
		{ new: true }
		);

		if (!file) {
		console.warn(`[APPROVE FILE] File not found: ${req.params.id}`);
		return res.status(404).json({ success: false, error: 'File not found' });
		}

		// No need to update older versions - that's handled during creation
		// We're removing the bidirectional update as requested

		console.log(`[APPROVE FILE] File approved: ${file._id}`);
		res.status(200).json({ success: true, data: file });
	} catch (err) {
		console.error(`[APPROVE FILE] Error: ${err.message}`);
		res.status(400).json({ success: false, error: err.message });
	}
};

// @desc    Reject a file with comment
exports.rejectFile = async (req, res, next) => {
	const { comment } = req.body;
	console.log(`[REJECT FILE] Request to reject file: ${req.params.id} with comment: "${comment}"`);

	try {
		const file = await File.findById(req.params.id);

		if (!file) {
			console.warn(`[REJECT FILE] File not found: ${req.params.id}`);
			return res.status(404).json({ success: false, error: 'File not found' });
		}

			// Update file status to rejected
			file.status = 'rejected';
			
			// Add the comment to the file's comments array
			if (comment) {
				// Initialize comments array if it doesn't exist
				if (!file.comments) {
					file.comments = [];
				}
				
				// Add the new comment with the user's ID as author
				file.comments.push({
					author: req.user.id,
					content: comment
				});
			}

			// Save the updated file
			await file.save();
			
			console.log(`[REJECT FILE] File rejected and comment added`);
			res.status(200).json({ success: true, data: file });
	} catch (err) {
		console.error(`[REJECT FILE] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Get all approved files
exports.getAllApprovedFiles = async (req, res, next) => {
	console.log(`[GET APPROVED FILES] Fetching approved files`);
	try {
		// Check if office is provided in the request params
		// const { office } = req.params;

		// Construct query based on whether office is provided
		// const query = office
		// 	? { status: 'approved', office: office }
		// 	: { status: 'approved' };

		const files = await File.find({ status: 'approved' }).populate('author', 'name').sort({ createdAt: -1});
		const latestFiles = files.filter(file => !file.versions || file.versions.length === 0);

		res.status(200).json({
			success: true,
			count: files.length,
			data: files
		});
	} catch (err) {
		console.error(`[GET APPROVED FILES] Error: ${err.message}`);
		res.status(500).json({
			success: false,
			error: 'Server error'
		});
	}
};

// @desc    Get all unapproved files
exports.getAllUnapprovedFiles = async (req, res, next) => {
	console.log(`[GET UNAPPROVED FILES] Fetching all unapproved files`);
	try {
		const files = await File.find({ status: { $ne: 'approved' } });
		res.status(200).json({ success: true, count: files.length, data: files });
	} catch (err) {
		console.error(`[GET UNAPPROVED FILES] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Get all pending files (for Superadmin)
exports.getPendingFiles = async (req, res, next) => {
	console.log(`[GET PENDING FILES] Request by ${req.user?.id}`);
	try {
		const files = await File.find({ status: 'pending' })
			.populate('author', 'name')
			.sort({ createdAt: -1 });
		res.status(200).json({ success: true, count: files.length, data: files });
	} catch (err) {
		console.error(`[GET PENDING FILES] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Add a new version to a file
exports.addFileVersion = async (req, res, next) => {
	const { name, url } = req.body;
	console.log(`[ADD FILE VERSION] Adding version to file: ${req.params.id}`);
  
	try {
	  const originalFile = await File.findById(req.params.id);
	  if (!originalFile) {
		return res.status(404).json({ success: false, error: 'File not found' });
	  }
  
	  // Check if either a file or URL is provided
	  if (!req.file && !url) {
		return next(new ErrorResponse(`Please upload a file or provide a URL`, 400));
	  }
  
	  // Use relative path
	  let filePath = req.file ? `uploads/files/${req.file.filename}` : null;
  
	  // Create version history array with the original file's information
	  const versionHistory = [
		{
		  name: originalFile.name,
		  // Use _id instead of fileId to match the expected format
		  _id: originalFile._id,
		  filePath: originalFile.filePath,
		  url: originalFile.url,
		  createdAt: originalFile.createdAt
		}
	  ];
  
	  // Add previous versions if they exist
	  if (originalFile.versions && originalFile.versions.length > 0) {
		versionHistory.push(...originalFile.versions);
	  }
  
	  const newFileData = {
		name,
		url: url || null,
		filePath,
		office: originalFile.office,
		category: originalFile.category,
		status: "pending",
		author: req.user.id,
		versions: versionHistory  // Now contains properly structured version history
	  };
  
	  const newFile = await File.create(newFileData);
  
	  console.log(`[ADD FILE VERSION] Version added successfully to file: ${newFile._id}`);
	  res.status(201).json({ success: true, data: newFile });
	}
	catch (err) {
	  console.error(`[ADD FILE VERSION] Error: ${err.message}`);
	  res.status(400).json({ success: false, error: err.message });
	}
  };

// @desc    Get categories for a specific office
exports.getOfficeCategories = async (req, res, next) => {
	try {
		const { office } = req.params;

		// Find all unique categories for the given office
		const categories = await File.distinct('category', { office });

		res.status(200).json({
			success: true,
			categories
		});
	} catch (err) {
		console.error('Error fetching office categories:', err);
		res.status(500).json({
			success: false,
			error: 'Could not fetch office categories'
		});
	}
};

// @desc    Add a new category to an office
exports.addOfficeCategory = async (req, res, next) => {
	try {
		const { office, category } = req.body;

		// Validate inputs
		if (!office) {
			return res.status(400).json({
				success: false,
				error: 'Office is required'
			});
		}

		if (!category) {
			return res.status(400).json({
				success: false,
				error: 'Category is required'
			});
		}

		// Check if category already exists for this office
		const existingCategories = await File.distinct('category', { office });

		if (existingCategories.includes(category)) {
			return res.status(400).json({
				success: false,
				error: 'Category already exists for this office'
			});
		}

		// Return updated list of categories
		res.status(201).json({
			success: true,
			categories: [...existingCategories, category]
		});
	} catch (err) {
		console.error('Error adding office category:', err);
		res.status(500).json({
			success: false,
			error: 'Could not add office category'
		});
	}
};

// @desc    Get files uploaded by the current user
exports.getFilesByCurrentUser = async (req, res, next) => {
	console.log(`[GET USER FILES] Request by user ID: ${req.user?.id}`);
	try {
		if (!req.user?.id) {
			console.error('[GET USER FILES] No user ID found in request');
			return res.status(401).json({ success: false, error: 'User not authenticated' });
		}

		const files = await File.find({ author: req.user.id })
			.populate('author', 'name')
			.populate('comments.author', 'name')
			.sort({ createdAt: -1 });

		console.log(`[GET USER FILES] Found ${files.length} files for user ${req.user.id}`);
		res.status(200).json({ success: true, count: files.length, data: files });
	} catch (err) {
		console.error(`[GET USER FILES] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    View/download a file by ID
exports.viewFile = async (req, res, next) => {
	console.log(`[VIEW FILE] Request to view/download file: ${req.params.id}`);
	try {
		const file = await File.findById(req.params.id);
		
		if (!file) {
		console.warn(`[VIEW FILE] File not found: ${req.params.id}`);
		return res.status(404).json({ success: false, error: 'File not found' });
		}

		// If this is a URL-only entry, redirect to the URL
		if (file.url && !file.filePath) {
		console.log(`[VIEW FILE] Redirecting to URL: ${file.url}`);
		return res.redirect(file.url);
		}

		// Check if file has a physical path
		if (!file.filePath) {
		console.warn(`[VIEW FILE] No file path found: ${req.params.id}`);
		return res.status(404).json({ success: false, error: 'No file path associated with this record' });
		}

		// Construct the absolute file path from the stored relative path
		const filePath = path.join(__dirname, '..', file.filePath);
		
		// Check if file exists
		if (!fs.existsSync(filePath)) {
		console.error(`[VIEW FILE] File not found on disk: ${filePath}`);
		return res.status(404).json({ success: false, error: 'File not found on disk' });
		}

		// Get file stats for content length
		const stat = fs.statSync(filePath);
		const fileSize = stat.size;
		const fileName = path.basename(filePath);
		
		// Get the file extension to determine content type
		const ext = path.extname(fileName).toLowerCase();
		
		// Set appropriate content type based on file extension
		let contentType = 'application/octet-stream'; // default
		if (ext === '.pdf') contentType = 'application/pdf';
		else if (ext === '.doc' || ext === '.docx') contentType = 'application/msword';
		else if (ext === '.xls' || ext === '.xlsx') contentType = 'application/vnd.ms-excel';
		else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
		else if (ext === '.png') contentType = 'image/png';
		else if (ext === '.txt') contentType = 'text/plain';
		
		// Set response headers
		res.setHeader('Content-Type', contentType);
		res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
		res.setHeader('Accept-Ranges', 'bytes');
		
		// Handle range requests (important for PDF streaming and resumable downloads)
		const range = req.headers.range;
		
		if (range) {
		// Parse the range header
		const parts = range.replace(/bytes=/, '').split('-');
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
		
		// Validate range
		if (start >= fileSize || end >= fileSize || start > end) {
			// Invalid range, respond with 416 Range Not Satisfiable
			res.statusCode = 416;
			res.setHeader('Content-Range', `bytes */${fileSize}`);
			console.error(`[VIEW FILE] Invalid range request: ${range} for file size ${fileSize}`);
			return res.end();
		}
		
		// Calculate chunk size
		const chunkSize = end - start + 1;
		
		// Set partial content headers
		res.statusCode = 206;
		res.setHeader('Content-Length', chunkSize);
		res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
		
		// Create read stream with range
		const fileStream = fs.createReadStream(filePath, { start, end });
		console.log(`[VIEW FILE] Streaming file with range ${start}-${end}/${fileSize}: ${fileName}`);
		fileStream.pipe(res);
		} else {
		// No range requested, stream the entire file
		res.setHeader('Content-Length', fileSize);
		console.log(`[VIEW FILE] Streaming entire file (${fileSize} bytes): ${fileName}`);
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
		}
	} catch (err) {
		console.error(`[VIEW FILE] Error: ${err.message}`);
		res.status(500).json({ success: false, error: 'Server error' });
	}
};