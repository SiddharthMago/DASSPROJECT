const mongoose = require('mongoose');

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
  icon: {
    type: String,
    default: '🔗' // Default icon
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  pinned: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true
  },
});

module.exports = mongoose.model('Portal', PortalSchema);