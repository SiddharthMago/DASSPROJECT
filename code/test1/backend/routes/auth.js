const express = require('express');
const { register, login, getUserDetails, getCurrentUserDetails, changeUserRole, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user', getUserDetails); // Public route to get details of any user
router.get('/current', protect, getCurrentUserDetails); // Public route to get current logged-in user details
router.put('/user/:email/role', protect, changeUserRole); // Only superadmin can change roles
router.get('/users', getAllUsers); // Public route to get all users

module.exports = router;