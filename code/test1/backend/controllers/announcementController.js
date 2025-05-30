const Announcement = require('../models/Announcement');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// @desc    Add a new announcement
// @route   POST /api/announcements
// @access  Admin
exports.addAnnouncement = async (req, res, next) => {
  try {
    const { title, office, link } = req.body;
    let imagePath;

    // Handle file upload if present
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const uploadPath = path.join(__dirname, '../uploads', fileName);

      // Move the file to the uploads directory
      fs.renameSync(req.file.path, uploadPath);

      // Store the relative path in the database
      imagePath = `/uploads/${fileName}`;
    }

    const announcement = await Announcement.create({
      title,
      office,
      image: imagePath, // If imagePath is undefined, the default from schema will be used
      link: link || undefined,
      status: 'pending',
      author: req.user._id // Add the author field from the authenticated user
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (err) {
    console.error('Error adding announcement:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Admin/Superadmin
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, office, link } = req.body;

    // Prepare update object
    const updateData = {
      title,
      office,
      link: link || '',
      status: 'pending', // Reset status to pending on update
      author: req.user._id // Update the author field to the current user
    };

    // Handle file upload if present
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const uploadPath = path.join(__dirname, '../uploads', fileName);

      // Move the file to the uploads directory
      fs.renameSync(req.file.path, uploadPath);

      // Store the relative path in the database
      updateData.image = `/uploads/${fileName}`;
    }

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Approve an announcement
// @route   PUT /api/announcements/:id/approve
// @access  Superadmin
exports.approveAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all approved announcements
// @route   GET /api/announcements
// @access  Public
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ status: 'approved' })
      .populate('author', 'name')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get the latest 5 approved announcements
// @route   GET /api/announcements/latest
// @access  Public
exports.getLatestAnnouncements = async (req, res, next) => {
  try {
    const latestAnnouncements = await Announcement.find({ status: 'approved' })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(5); // Limit to 5 announcements

    res.status(200).json({
      success: true,
      count: latestAnnouncements.length,
      data: latestAnnouncements,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get all unapproved announcements
// @route   GET /api/announcements/unapproved
// @access  Admin/Superadmin
exports.getUnapprovedAnnouncements = async (req, res, next) => {
  try {
    const unapprovedAnnouncements = await Announcement.find({ status: 'pending' })
      .populate('author', 'name') // Populate the author field with the name
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    res.status(200).json({
      success: true,
      count: unapprovedAnnouncements.length,
      data: unapprovedAnnouncements,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Admin/Superadmin
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get announcements created by the current user
// @route   GET /api/announcements/my-announcements
// @access  Admin/Superadmin
exports.getMyAnnouncements = async (req, res, next) => {
  try {
    // Find all announcements where the author is the current user
    const announcements = await Announcement.find({ author: req.user._id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    console.error('Error fetching user announcements:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
};

// @desc    Reject an announcement with a comment
// @route   PUT /api/announcements/:id/reject
// @access  Superadmin
exports.rejectAnnouncement = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection comment required' });
    }
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    announcement.status = 'rejected';
    announcement.comments.push({
      author: req.user._id,
      content: comment
    });
    await announcement.save();

    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};