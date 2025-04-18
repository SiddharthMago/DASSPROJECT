// routes/auth_cas.js
const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserDetails, getCurrentUserDetails, changeUserRole, getAllUsers, addUser, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/user', getUserDetails);
router.get('/current', protect, getCurrentUserDetails);
router.put('/user/:email/role', protect, authorize("superadmin"), changeUserRole);
router.get('/users', getAllUsers);
router.post('/addUser', protect, authorize("superadmin"), addUser);
router.put('/user/:email', protect, authorize("superadmin"), updateUser);
router.delete('/user/:email', protect, authorize("superadmin"), deleteUser);

router.get('/cas-callback', async (req, res) => {
    const { ticket } = req.query;
    const serviceURL = `http://localhost:5000/api/auth_cas/cas-callback`;

    if (!ticket) {
        return res.status(400).send("Missing CAS ticket");
    }
    
    try {
        console.log("Received CAS ticket:", ticket);

        const response = await axios.get('https://login.iiit.ac.in/cas/serviceValidate', {
            params: {
                service: serviceURL,
                ticket: ticket
            }
        });

        const result = await parseStringPromise(response.data);
        console.log(JSON.stringify(result, null, 2));
        const userDetails = result['cas:serviceResponse']['cas:authenticationSuccess']?.[0]['cas:attributes']?.[0];

        if (!userDetails) return res.status(401).send('CAS Authentication Failed');

        // Now map user to role
        const role = await determineRole(userDetails); // You can enhance this with a DB lookup
        console.log("JWT_SECRET:", process.env.JWT_SECRET);

        const token = jwt.sign({ userDetails, role }, process.env.JWT_SECRET, {expiresIn: '1h'});

        // Redirect to frontend with token
        // res.redirect(`http://localhost:5173/${role}/`);
        const frontendURL = process.env.FRONTEND_URL
        console.log("Generated Token:", token);
        res.redirect(`${frontendURL}/auth?token=${token}`);

    } 
    
    catch (err) {
        console.error(err);
        res.status(500).send('CAS validation failed.');
    }
});

router.get('/user-profile', protect, async (req, res) => {
  try {
    // Ensure the user is found and has the correct fields
    const user = await User.findById(req.user._id).select('office name email role');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      office: user.office,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Could not fetch user profile',
      details: err.message 
    });
  }
});

async function determineRole(userDetails) {
    const email = userDetails?.["cas:E-Mail"]?.[0];
    const user = await User.findOne({ email: email });
    return user ? user.role : "user";
}


router.get('/logout', (req, res) => {
    res.clearCookie("token");
    const frontendURL = process.env.FRONTEND_URL;
    res.redirect(`https://login.iiit.ac.in/cas/logout?service=${frontendURL}`);
})

module.exports = router;
