const mongoose = require('mongoose');

const FileVersionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name for the file version'],
	},
	url: {
		type: String,
		required: false,
	},
	filePath: {
		type: String,
		required: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

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

const FileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name for the file'],
      trim: true,
      minlength: [2, 'File name must be at least 2 characters long']
    },
    url: {
      type: String,
      required: false,
    },
    filePath: {
      type: String,
      required: false,
      default: null,
    },
    office: {
      type: String,
      enum: ['Admissions Office',
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
            'HR & Personnel',],
      required: [true, 'Please specify the office related to the file'],
    },
    category: {
      type: String,
      required: [true, 'Please specify the category of the file'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    versions: [FileVersionSchema],
    comments: {
      type: [CommentSchema],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', FileSchema);