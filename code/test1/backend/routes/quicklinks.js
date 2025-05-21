const express = require('express');
const {
  addQuickLink,
  deleteQuickLink,
  editQuickLink,
  getAllApprovedQuickLinks,
  getAllUnapprovedQuickLinks,
  getAllPinnedQuickLinks,
  pinQuickLink,
  unpinQuickLink,
  approveQuickLink,
  getMyQuickLinks,
  rejectQuickLink,
} = require('../controllers/quickLinkController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin', 'superadmin'), addQuickLink);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteQuickLink);
router.put('/:id', protect, authorize('admin', 'superadmin'), editQuickLink);
router.get('/', getAllApprovedQuickLinks); // Public route to get all approved quick links
router.get('/unapproved', protect, authorize('superadmin'), getAllUnapprovedQuickLinks);
router.get('/pinned', getAllPinnedQuickLinks); // Public route to get all pinned quick links
router.put('/:id/pin', protect, authorize('admin', 'superadmin'), pinQuickLink);
router.put('/:id/unpin', protect, authorize('admin', 'superadmin'), unpinQuickLink);
router.put('/:id/approve', protect, authorize('superadmin'), approveQuickLink);
router.get('/my-links', protect, authorize('admin', 'superadmin'), getMyQuickLinks);
router.put('/:id/reject', protect, authorize('superadmin'), rejectQuickLink);

module.exports = router;