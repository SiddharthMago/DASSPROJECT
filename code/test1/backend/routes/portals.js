const express = require('express');
const router = express.Router();
const { 
  getAllApprovedPortals, 
  getUnapprovedPortals,
  getPinnedPortals,
  addPortal,
  deletePortal,
  updatePortal,
  approvePortal,
  rejectPortal,
  togglePin,
} = require('../controllers/portalController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getAllApprovedPortals);
router.get('/pinned', getPinnedPortals);

// Admin / Superadmin
router.post('/', protect, authorize('admin','superadmin'), addPortal);
router.put('/:id', protect, authorize('admin','superadmin'), updatePortal);
router.delete('/:id', protect, authorize('admin','superadmin'), deletePortal);
router.put('/:id/pin', protect, authorize('admin','superadmin'), togglePin);

// Superadmin only
router.get('/unapproved', protect, authorize('superadmin'), getUnapprovedPortals);
router.put('/:id/approve', protect, authorize('superadmin'), approvePortal);
router.put('/:id/reject', protect, authorize('superadmin'), rejectPortal);

module.exports = router;