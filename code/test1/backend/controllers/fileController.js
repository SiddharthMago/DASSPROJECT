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
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({ storage });

module.exports.upload = upload;

exports.addFile = async (req, res, next) => {
	try {
		if (!req.file) {
			return next(new ErrorResponse(`Please upload a file`, 400));
		}

		const { name, office, category } = req.body;

    if (!name || !office || !category) {
      return next(new ErrorResponse(`Please provide all required fields`, 400));
    }

    // Store relative path instead of absolute path
    const relativePath = `uploads/files/${req.file.filename}`;

    const file = await File.create({
      name,
      filePath: relativePath,
      url: req.file.filename,
      office,
      category,
      author: req.user.id // Use the authenticated user's ID
    });

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

		if (file.status === 'approved' || file.status === 'rejected') {
			return res.status(400).json({ success: false, error: 'File has already been processed' });
		}

		file.status = 'rejected';
		if (comment) {
			file.comments = file.comments || [];
			file.comments.push({
				author: req.user.id,
				content: comment,
			});
		}

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
		const { office } = req.params;

		// Construct query based on whether office is provided
		const query = office
			? { status: 'approved', office: office }
			: { status: 'approved' };

		const files = await File.find(query);

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
			.populate('author', 'name');
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
		const file = await File.findById(req.params.id);
		if (!file) {
			return res.status(404).json({ success: false, error: 'File not found' });
		}

    // Use relative path
    let filePath = req.file ? `uploads/files/${req.file.filename}` : null;

		const newVersion = {
			name,
			url: url || null,
			filePath,
		};

		file.versions.push(newVersion);
		file.name = name;
		file.url = url || null;
		file.filePath = filePath;

		await file.save();
		console.log(`[ADD FILE VERSION] Version added successfully to file: ${file._id}`);
		res.status(201).json({ success: true, data: file });
	} catch (err) {
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

    // Check if file has a physical path (not a URL-only entry)
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

    // Get file name from path
    const fileName = path.basename(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log(`[VIEW FILE] Successfully streaming file: ${fileName}`);
  } catch (err) {
    console.error(`[VIEW FILE] Error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};