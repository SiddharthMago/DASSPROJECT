const Faq = require('../models/Faq');

// @desc    Add a new FAQ
// @route   POST /api/faqs
// @access  Admin/Superadmin
exports.addFaq = async (req, res, next) => {
  const { question, answer, office, keywords } = req.body;

  try {
    const faq = await Faq.create({
      question,
      answer,
      office,
      keywords,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Admin/Superadmin
exports.deleteFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Edit an FAQ
// @route   PUT /api/faqs/:id
// @access  Admin/Superadmin
exports.editFaq = async (req, res, next) => {
  const { question, answer, office, keywords } = req.body;

  try {
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer, office, keywords },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getAllQuestions = async (req, res, next) => {
  try {
    const faqs = await Faq.find();

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Search FAQs by keywords
// @route   GET /api/faqs/search
// @access  Public
exports.searchOtherQuestions = async (req, res, next) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ success: false, error: 'Keyword is required' });
  }

  try {
    const faqs = await Faq.find({
      keywords: { $regex: keyword, $options: 'i' }, // Case-insensitive search
    });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};