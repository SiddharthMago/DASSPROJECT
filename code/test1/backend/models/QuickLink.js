const mongoose = require('mongoose');

const QuickLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the quick link'],
  },
  url: {
    type: String,
    required: [true, 'Please add a URL for the quick link'],
    match: [
      /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/,
      'Please add a valid URL',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
    default: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('QuickLink', QuickLinkSchema);