const express = require('express');
const router = express.Router();
const File = require('../models/Files');
const Faq = require('../models/Faq');
const { protect, authorize } = require('../middleware/auth');

// Get files for a specific office (for admin/superadmin - including unapproved)
router.get('/files/:office', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { office } = req.params;
    
    const files = await File.find({ 
      office: office,
      status: { $in: ['pending', 'approved', 'rejected'] } 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (err) {
    console.error(`Error fetching office files: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get FAQs for a specific office (for admin/superadmin)
router.get('/faqs/:office', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { office } = req.params;
    
    const faqs = await Faq.find({ office }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (err) {
    console.error(`Error fetching office FAQs: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Create a new FAQ for an office
router.post('/faqs', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { question, answer, office } = req.body;

    if (!question || !answer || !office) {
      return res.status(400).json({
        success: false,
        error: 'Question, answer, and office are required'
      });
    }

    const newFaq = await Faq.create({
      question,
      answer,
      office,
      keywords: question.toLowerCase().match(/\b\w+\b/g)
    });

    res.status(201).json({
      success: true,
      data: newFaq
    });
  } catch (err) {
    console.error(`Error creating FAQ: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Update a FAQ
router.put('/faqs/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Question and answer are required'
      });
    }

    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id, 
      { 
        question, 
        answer,
        keywords: question.toLowerCase().match(/\b\w+\b/g)
      }, 
      { new: true, runValidators: true }
    );

    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFaq
    });
  } catch (err) {
    console.error(`Error updating FAQ: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Delete a FAQ
router.delete('/faqs/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const deletedFaq = await Faq.findByIdAndDelete(req.params.id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(`Error deleting FAQ: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

module.exports = router;