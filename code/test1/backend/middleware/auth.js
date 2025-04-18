const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check for token in cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by email from the token (not by ID)
    const user = await User.findOne({ email: decoded.userDetails["cas:E-Mail"][0] });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (!decoded.userDetails || !decoded.userDetails["cas:E-Mail"]) {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

		// Attach the user to the request object based on the decoded token
		if (decoded.userDetails) {
			const email = decoded.userDetails["cas:E-Mail"]?.[0];
			req.user = await User.findOne({ email });
		}
		else {
			console.log("Could not find email ID of the user logged in.");
		}

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user data found, please ensure the protect middleware was applied correctly');
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Check if the user has the required role
    if (!roles.includes(req.user.role)) {
      console.log(`Access denied for user with role ${req.user.role}`);
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    console.log(`Access granted for user with role ${req.user.role}`);
    next();
  };
};