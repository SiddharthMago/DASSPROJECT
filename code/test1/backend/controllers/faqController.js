const Faq = require('../models/Faq');

// @desc    Add new FAQ
// @route   POST /api/faqs
// @access  Private (admin, superadmin)
exports.addFaq = async (req, res) => {
  try {
    const { question, answer, office } = req.body;

    if (!question || !answer || !office) {
      return res.status(400).json({
        success: false,
        error: 'Please provide question, answer, and office'
      });
    }

    const faq = await Faq.create({
      question,
      answer,
      office
    });

    res.status(201).json({
      success: true,
      data: faq
    });
  } catch (err) {
    console.error(`Error adding FAQ: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete FAQ by ID
// @route   DELETE /api/faqs/:id
// @access  Private (admin, superadmin)
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await faq.remove();

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
};

// @desc    Update FAQ by ID
// @route   PUT /api/faqs/:id
// @access  Private (admin, superadmin)
exports.editFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Please provide question and answer'
      });
    }

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (err) {
    console.error(`Error updating FAQ: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getAllQuestions = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (err) {
    console.error(`Error fetching FAQs: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search FAQs by keywords
// @route   GET /api/faqs/search
// @access  Public
exports.searchOtherQuestions = async (req, res) => {
  try {
    const { q, office } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }

    // Process the search query
    const searchTerms = q.toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove special characters
      .split(/\s+/)             // Split by whitespace
      .filter(word => word.length > 2);  // Filter out short words

    // Build the query object
    const query = {
      $or: [
        { keywords: { $in: searchTerms } },
        { question: { $regex: searchTerms.join('|'), $options: 'i' } }
      ]
    };

    // Add office filter if provided
    if (office) {
      query.office = office;
    }

    const faqs = await Faq.find(query).sort({ createdAt: -1 });

    // Calculate relevance score for better sorting
    const scoredFaqs = faqs.map(faq => {
      // Count keyword matches
      const keywordMatches = faq.keywords.filter(keyword => 
        searchTerms.includes(keyword)
      ).length;
      
      // Check for direct substring matches
      const questionLower = faq.question.toLowerCase();
      const directMatches = searchTerms.filter(word => 
        questionLower.includes(word)
      ).length;
      
      // Calculate overall relevance score
      const relevanceScore = keywordMatches + (directMatches * 2);
      
      return {
        ...faq.toObject(),
        relevanceScore
      };
    });

    // Sort by relevance score (highest first)
    scoredFaqs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.status(200).json({
      success: true,
      count: scoredFaqs.length,
      data: scoredFaqs
    });
  } catch (err) {
    console.error(`Error searching FAQs: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search for similar FAQs (for duplicate detection)
// @route   POST /api/faqs/search-similar
// @access  Private (admin, superadmin)
exports.searchSimilarFaqs = async (req, res) => {
  try {
    const { question, office } = req.body;
    
    if (!question || !office) {
      return res.status(400).json({
        success: false,
        error: 'Question and office are required'
      });
    }
    
    // Process the question to extract keywords
    const searchWords = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    if (searchWords.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Find FAQs with matching keywords for the specific office
    const similarFaqs = await Faq.find({
      office,
      $or: [
        { keywords: { $in: searchWords } },
        { question: { $regex: searchWords.join('|'), $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    // Calculate similarity score using more sophisticated algorithm
    const scoredFaqs = similarFaqs.map(faq => {
      // Count how many keywords match
      const keywordMatches = faq.keywords.filter(keyword => 
        searchWords.includes(keyword)
      ).length;
      
      // Check for direct substring matches
      const questionLower = faq.question.toLowerCase();
      const directMatches = searchWords.filter(word => 
        questionLower.includes(word)
      ).length;
      
      // Calculate word overlap ratio
      const faqWords = faq.keywords.length;
      const queryWords = searchWords.length;
      const overlapRatio = keywordMatches / Math.max(faqWords, queryWords);
      
      // Calculate overall similarity score (weighted formula)
      const similarityScore = Math.round(
        (keywordMatches * 1.5) + 
        (directMatches * 2) + 
        (overlapRatio * 10)
      );
      
      return {
        ...faq.toObject(),
        similarityScore
      };
    });
    
    // Sort by similarity score (highest first)
    scoredFaqs.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Only return FAQs with a minimum similarity score to reduce noise
    const filteredFaqs = scoredFaqs.filter(faq => faq.similarityScore > 2);
    
    res.status(200).json({
      success: true,
      count: filteredFaqs.length,
      data: filteredFaqs
    });
  } catch (err) {
    console.error(`Error searching similar FAQs: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};