const express = require('express');
const {
  addAnnouncement,
  approveAnnouncement,
  getAllAnnouncements,
  getLatestAnnouncements,
  getUnapprovedAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  getMyAnnouncements,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Replace spaces with underscores in the original filename
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + path.extname(sanitizedName));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.post('/', protect, authorize('admin', 'superadmin'), upload.single('image'), addAnnouncement);
router.put('/:id/approve', protect, authorize('superadmin'), approveAnnouncement);
router.get('/', getAllAnnouncements); // Public route to get all announcements
router.get('/latest', getLatestAnnouncements); // Public route to get the latest 5 announcements
router.get('/unapproved', protect, authorize('superadmin'), getUnapprovedAnnouncements); // Admin/Superadmin route to get unapproved announcements
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteAnnouncement); // Admin/Superadmin route to delete an announcement
router.put('/:id', protect, authorize('admin', 'superadmin'), upload.single('image'), updateAnnouncement);
router.get('/my-announcements', protect, authorize('admin', 'superadmin'), getMyAnnouncements);

module.exports = router;