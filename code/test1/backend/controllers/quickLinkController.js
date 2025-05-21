const QuickLink = require('../models/QuickLink');

// @desc    Add a new quick link
// @route   POST /api/quicklinks
// @access  Admin/Superadmin
exports.addQuickLink = async (req, res, next) => {
  try {
    const { title, url, office = 'Administration' } = req.body;
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
      status: 'pending',
      pinned: false,
      author: req.user._id
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
      { 
        title, 
        url, 
        office,
        status: 'pending',
        author: req.user._id
      },
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
    const quickLinks = await QuickLink.find({ status: 'approved' })
      .populate('author', 'name email');

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
    const quickLinks = await QuickLink.find({ status: 'pending' })
      .populate('author', 'name email');

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
      { status: 'approved' },
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
    const pinnedQuickLinks = await QuickLink.find({ pinned: true })
      .populate('author', 'name email');

    res.status(200).json({
      success: true,
      count: pinnedQuickLinks.length,
      data: pinnedQuickLinks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get quick links created by the current user
// @route   GET /api/quicklinks/my-links
// @access  Admin/Superadmin
exports.getMyQuickLinks = async (req, res, next) => {
  try {
    // Find all quick links where the author is the current user
    const quickLinks = await QuickLink.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quickLinks.length,
      data: quickLinks,
    });
  } catch (err) {
    console.error('Error fetching user quick links:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: err.message
    });
  }
};

// @desc    Reject a quick link
// @route   PUT /api/quicklinks/:id/reject
// @access  Superadmin
exports.rejectQuickLink = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection comment required' });
    }

    const quickLink = await QuickLink.findById(req.params.id);
    if (!quickLink) return res.status(404).json({ success: false, error: 'Not found' });

    // guard against null
    if (!Array.isArray(quickLink.comments)) quickLink.comments = [];

    quickLink.status = 'rejected';
    quickLink.comments.push({
      author: req.user._id,
      content: comment.trim()
    });

    await quickLink.save();
    res.json({ success: true, data: quickLink });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};