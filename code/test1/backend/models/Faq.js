const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Please add an answer'],
        trim: true
    },
    office: {
        type: String,
        enum: [
            'Admissions Office',
            'Library Office',
            'Examinations Office',
            'Academic Office',
            'Student Affairs Office',
            'Mess Office',
            'Hostel Office',
            'Alumni Cell',
            'Faculty Portal',
            'Placement Cell',
            'Outreach Office',
            'Statistical Cell',
            'R&D Office',
            'General Administration',
            'Accounts Office',
            'IT Services Office',
            'Communication Office',
            'Engineering Office',
            'HR & Personnel',
        ],
        required: [true, 'Please specify the office related to the FAQ'],
    },
    keywords: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updateCount: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to generate keywords
FaqSchema.pre('save', function(next) {
    if (this.isModified('question')) {
      // Extract unique words from the question, convert to lowercase
      const questionWords = this.question.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 2); // Filter out short words
      
      this.keywords = [...new Set(questionWords)]; // Remove duplicates
      
      // Update the lastUpdated field
      this.lastUpdated = Date.now();
      
      // Increment update count if not a new document
      if (!this.isNew) {
        this.updateCount += 1;
      }
    }
    next();
});

// Add textScore index for better text search
FaqSchema.index(
    { question: 'text', keywords: 'text' }, 
    { 
        weights: { 
            question: 10, 
            keywords: 5 
        },
        name: 'text_search_index'
    }
);

// Additional indexes for frequent queries
FaqSchema.index({ office: 1, createdAt: -1 });
FaqSchema.index({ keywords: 1 });

// Static method to find similar FAQs
FaqSchema.statics.findSimilar = async function(questionText, office) {
    // Process the question to extract keywords
    const searchWords = questionText.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    if (searchWords.length === 0) {
        return [];
    }
    
    // Create a regex pattern for partial matching
    const regexPattern = searchWords.map(word => `(?=.*${word})`).join('');
    
    // Find FAQs with matching keywords or text for the specific office
    const similarFaqs = await this.find({
        office,
        $or: [
            { keywords: { $in: searchWords } },
            { question: { $regex: regexPattern, $options: 'i' } }
        ]
    }).sort({ createdAt: -1 });
    
    return similarFaqs.map(faq => {
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
        
        // Calculate overall similarity score
        const similarityScore = Math.round(
            (keywordMatches * 1.5) + 
            (directMatches * 2) + 
            (overlapRatio * 10)
        );
        
        return {
            ...faq.toObject(),
            similarityScore
        };
    })
    .filter(faq => faq.similarityScore > 2)
    .sort((a, b) => b.similarityScore - a.similarityScore);
};

module.exports = mongoose.model('Faq', FaqSchema);