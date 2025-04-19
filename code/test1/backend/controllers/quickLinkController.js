const QuickLink = require('../models/QuickLink');

// @desc    Add a new quick link
// @route   POST /api/quicklinks
// @access  Admin/Superadmin
exports.addQuickLink = async (req, res, next) => {
  try {
    console.log('Received QuickLink Creation Request:', req.body);
    console.log('Authenticated User:', req.user);

    const { title, url, office = 'Administration' } = req.body;

    // Explicit validation
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    const quickLink = await QuickLink.create({
      title,
      url,
      office,
      approved: true,
      pinned: true
    });

    res.status(201).json({
      success: true,
      data: quickLink,
    });
  } catch (err) {
    console.error('QuickLink Creation Error:', err);
    
    // More detailed error response
    res.status(400).json({ 
      success: false, 
      error: err.message,
      details: err.errors ? Object.keys(err.errors) : null
    });
  }
};

// @desc    Delete a quick link
// @route   DELETE /api/quicklinks/:id
// @access  Admin/Superadmin
exports.deleteQuickLink = async (req, res, next) => {
  try {
    const quickLink = await QuickLink.findByIdAndDelete(req.params.id);

    if (!quickLink) {
      return res.status(404).json({ success: false, error: 'Quick link not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quick link deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Edit a quick link
// @route   PUT /api/quicklinks/:id
// @access  Admin/Superadmin
exports.editQuickLink = async (req, res, next) => {
  const { title, url, office } = req.body;

  try {
    const quickLink = await QuickLink.findByIdAndUpdate(
      req.params.id,
      { title, url, office },
      { new: true, runValidators: true }
    );

    if (!quickLink) {
      return res.status(404).json({ success: false, error: 'Quick link not found' });
    }

    res.status(200).json({
      success: true,
      data: quickLink,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all approved quick links
// @route   GET /api/quicklinks
// @access  Public
exports.getAllApprovedQuickLinks = async (req, res, next) => {
  try {
    const quickLinks = await QuickLink.find({ approved: true });

    res.status(200).json({
      success: true,
      count: quickLinks.length,
      data: quickLinks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get all unapproved quick links
// @route   GET /api/quicklinks/unapproved
// @access  Admin/Superadmin
exports.getAllUnapprovedQuickLinks = async (req, res, next) => {
  try {
    const quickLinks = await QuickLink.find({ approved: false });

    res.status(200).json({
      success: true,
      count: quickLinks.length,
      data: quickLinks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Pin a quick link
// @route   PUT /api/quicklinks/:id/pin
// @access  Admin/Superadmin
exports.pinQuickLink = async (req, res, next) => {
  try {
    const quickLink = await QuickLink.findByIdAndUpdate(
      req.params.id,
      { pinned: true },
      { new: true }
    );

    if (!quickLink) {
      return res.status(404).json({ success: false, error: 'Quick link not found' });
    }

    res.status(200).json({
      success: true,
      data: quickLink,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Unpin a quick link
// @route   PUT /api/quicklinks/:id/unpin
// @access  Admin/Superadmin
exports.unpinQuickLink = async (req, res, next) => {
  try {
    const quickLink = await QuickLink.findByIdAndUpdate(
      req.params.id,
      { pinned: false },
      { new: true }
    );

    if (!quickLink) {
      return res.status(404).json({ success: false, error: 'Quick link not found' });
    }

    res.status(200).json({
      success: true,
      data: quickLink,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Approve a quick link
// @route   PUT /api/quicklinks/:id/approve
// @access  Superadmin
exports.approveQuickLink = async (req, res, next) => {
  try {
    const quickLink = await QuickLink.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!quickLink) {
      return res.status(404).json({ success: false, error: 'Quick link not found' });
    }

    res.status(200).json({
      success: true,
      data: quickLink,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all pinned quick links
// @route   GET /api/quicklinks/pinned
// @access  Public
exports.getAllPinnedQuickLinks = async (req, res, next) => {
    try {
      const pinnedQuickLinks = await QuickLink.find({ pinned: true });
  
      res.status(200).json({
        success: true,
        count: pinnedQuickLinks.length,
        data: pinnedQuickLinks,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };