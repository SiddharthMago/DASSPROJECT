const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question'],
    },
    answer: {
        type: String,
        required: [true, 'Please add an answer'],
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
});

// Pre-save middleware to populate keywords from the question
FaqSchema.pre('save', function (next) {
    if (this.question) {
        // Extract words from the question and store them as keywords
        this.keywords = this.question
            .toLowerCase() // Convert to lowercase
            .match(/\b\w+\b/g); // Extract words using regex
    }
    next();
});

module.exports = mongoose.model('Faq', FaqSchema);