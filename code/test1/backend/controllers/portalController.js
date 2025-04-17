const Portal = require('../models/Portal');

// @desc    Get all approved portals
// @route   GET /api/portals
// @access  Public
exports.getAllApprovedPortals = async (req, res, next) => {
  try {
    const portals = await Portal.find({ approved: true })
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
    const portals = await Portal.find({ approved: false })
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
    const portals = await Portal.find({ pinned: true, approved: true })
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
    const { title, url, icon } = req.body;

    const portal = await Portal.create({
      title,
      url,
      icon: icon || '🔗' // Use provided icon or default
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
      { title, url, icon },
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

// @desc    Toggle portal approval status
// @route   PUT /api/portals/:id/approve
// @access  Superadmin
exports.toggleApproval = async (req, res, next) => {
  try {
    const portal = await Portal.findById(req.params.id);

    if (!portal) {
      return res.status(404).json({
        success: false,
        error: 'No portal found'
      });
    }

    portal.approved = !portal.approved;
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