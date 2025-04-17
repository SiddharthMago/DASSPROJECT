const express = require('express');
const router = express.Router();
const { 
  getAllApprovedPortals, 
  getUnapprovedPortals,
  getPinnedPortals,
  addPortal,
  deletePortal,
  updatePortal,
  toggleApproval,
  togglePin
} = require('../controllers/portalController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllApprovedPortals);
router.get('/pinned', getPinnedPortals);

// Protected routes (admin only)
router.post('/', protect, authorize('admin', 'superadmin'), addPortal);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deletePortal);
router.put('/:id', protect, authorize('admin', 'superadmin'), updatePortal);
router.put('/:id/pin', protect, authorize('admin', 'superadmin'), togglePin);

// Protected routes (superadmin only)
router.get('/unapproved', protect, authorize('superadmin'), getUnapprovedPortals);
router.put('/:id/approve', protect, authorize('superadmin'), toggleApproval);

module.exports = router;