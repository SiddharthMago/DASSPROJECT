const Portal = require('../models/Portal');

// @desc    Get all approved portals
// @route   GET /api/portals
// @access  Public
exports.getAllApprovedPortals = async (req, res, next) => {
  try {
    const portals = await Portal.find({ status: 'approved' })
      .sort({ createdAt: -1 }); // Sort by createdAt descending

    res.status(200).json({
      success: true,
      count: portals.length,
      data: portals
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all unapproved portals
// @route   GET /api/portals/unapproved
// @access  Admin/Superadmin
exports.getUnapprovedPortals = async (req, res, next) => {
  try {
    const portals = await Portal.find({ status: 'pending' })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portals.length,
      data: portals
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all pinned portals
// @route   GET /api/portals/pinned
// @access  Public
exports.getPinnedPortals = async (req, res, next) => {
  try {
    const portals = await Portal.find({ pinned: true, status: 'approved' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portals.length,
      data: portals
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add new portal
// @route   POST /api/portals
// @access  Admin/Superadmin
exports.addPortal = async (req, res, next) => {
  try {
    const { title, url, icon, office } = req.body;

    const portal = await Portal.create({
      title,
      url,
      icon: icon || '🔗',
      author: req.user._id,
      createdAt: Date.now(),
      status: 'pending',
      pinned: false
    });

    res.status(201).json({
      success: true,
      data: portal
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete portal
// @route   DELETE /api/portals/:id
// @access  Admin/Superadmin
exports.deletePortal = async (req, res, next) => {
  try {
    const portal = await Portal.findById(req.params.id);

    if (!portal) {
      return res.status(404).json({
        success: false,
        error: 'No portal found'
      });
    }

    await portal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update portal
// @route   PUT /api/portals/:id
// @access  Admin/Superadmin
exports.updatePortal = async (req, res, next) => {
  try {
    const { title, url, icon } = req.body;
    
    const portal = await Portal.findByIdAndUpdate(
      req.params.id,
      { title, url, icon, status: 'pending', author: req.user._id },
      { new: true, runValidators: true }
    );

    if (!portal) {
      return res.status(404).json({
        success: false,
        error: 'No portal found'
      });
    }

    res.status(200).json({
      success: true,
      data: portal
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc  Approve a portal
// @route PUT /api/portals/:id/approve
// @access Superadmin
exports.approvePortal = async (req, res) => {
  const portal = await Portal.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  );
  if (!portal) return res.status(404).json({ success: false, error: 'Portal not found' });
  res.json({ success: true, data: portal });
};

// @desc  Reject a portal with a comment
// @route PUT /api/portals/:id/reject
// @access Superadmin
exports.rejectPortal = async (req, res) => {
  const { comment } = req.body;
  if (!comment?.trim()) return res.status(400).json({ success: false, error: 'Rejection comment required' });
  const portal = await Portal.findById(req.params.id);
  if (!portal) return res.status(404).json({ success: false, error: 'Portal not found' });
  portal.status = 'rejected';
  portal.comments.push({ author: req.user._id, content: comment });
  await portal.save();
  res.json({ success: true, data: portal });
};

// @desc    Toggle portal pinned status
// @route   PUT /api/portals/:id/pin
// @access  Admin/Superadmin
exports.togglePin = async (req, res, next) => {
  try {
    const portal = await Portal.findById(req.params.id);

    if (!portal) {
      return res.status(404).json({
        success: false,
        error: 'No portal found'
      });
    }

    portal.pinned = !portal.pinned;
    await portal.save();

    res.status(200).json({
      success: true,
      data: portal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};