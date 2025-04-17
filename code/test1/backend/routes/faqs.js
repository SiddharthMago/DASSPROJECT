const Faq = require('../models/Faq');
const express = require('express');
const {
  addFaq,
  deleteFaq,
  editFaq,
  getAllQuestions,
  searchOtherQuestions,
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin', 'superadmin'), addFaq);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteFaq);
router.put('/:id', protect, authorize('admin', 'superadmin'), editFaq);
router.get('/', getAllQuestions); // Public route to get all FAQs
router.get('/search', searchOtherQuestions); // Public route to search FAQs by keywords
router.get('/office/:office', async (req, res) => {
  try {
    const { office } = req.params;
    const faqs = await Faq.find({ office });
    
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (err) {
    console.error('Error fetching office FAQs:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Could not fetch FAQs' 
    });
  }
});

module.exports = router;