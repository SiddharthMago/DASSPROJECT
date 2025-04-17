const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the announcement'],
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
    required: [true, 'Please select an office for the announcement'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    default: function () {
      // Set default image based on the office
      return `/uploads/announcements_bg/${this.office}.jpg`;
    },
  },
  link: {
    type: String,
    default: 'https://youtube.com', // Default link
    required: [true, 'Please add a link for the announcement'],
  },
  approved: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);