const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PortalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the portal'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  url: {
    type: String,
    required: [true, 'Please add a URL for the portal'],
    match: [
      /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/,
      'Please add a valid URL'
    ]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  icon: {
    type: String,
    default: '🔗' // Default icon
  },
  createdAt: {
    type: Date,
    default: Date.now
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
    required: [true, 'Please select an office for the quick link'],
  },
  pinned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending','approved','rejected'],
    default: 'pending',
    required: true
  },
  comments: {
    type: [CommentSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portal', PortalSchema);