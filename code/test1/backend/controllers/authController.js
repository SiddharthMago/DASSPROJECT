const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
	const { email, role, office, name } = req.body;

	try {
		const user = await User.create({
			email,
			role,
			office,
			name,
		});

		res.status(201).json({
			success: true,
			data: user,
		});
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
	}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ success: false, error: 'Please provide an email' });
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({ success: false, error: 'Invalid credentials' });
		}

		// Generate token and send response
		sendTokenResponse(user, 200, res);
	} catch (err) {
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Get user details
// @route   GET /api/auth/user
// @access  Public
exports.getUserDetails = async (req, res, next) => {
	const userId = req.query.id; // Get user ID from query parameters

	if (!userId) {
		return res.status(400).json({ success: false, error: 'User ID is required' });
	}

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' });
		}

		res.status(200).json({
			success: true,
			data: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				office: user.office,
				createdAt: user.createdAt,
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Get current logged-in user details
// @route   GET /api/auth/current
// @access  Public
exports.getCurrentUserDetails = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id); // `req.user` is populated by the `protect` middleware

		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' });
		}

		res.status(200).json({
			success: true,
			data: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				office: user.office,
				createdAt: user.createdAt,
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Public
exports.getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find().select('-__v'); // Exclude the `__v` field

		res.status(200).json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// @desc    Change user role
// @route   PUT /api/auth/user/:id/role
// @access  Admin, Superadmin
exports.changeUserRole = async (req, res, next) => {
	const { role } = req.body;
	const { email } = req.params;

	if (!['user', 'admin', 'superadmin'].includes(role)) {
		return res.status(400).json({ success: false, error: 'Invalid role' });
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' });
		}

		// Only superadmin can change roles
		if (req.user.role === 'user') {
			return res.status(403).json({ success: false, error: 'Not authorized to change roles' });
		}

		user.role = role;
		await user.save();

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: 'Server error' });
	}
};

// Get token from model, create cookie, and send response
const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};