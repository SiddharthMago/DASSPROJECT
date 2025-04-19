const express = require('express');
const File = require('../models/Files');
const {
  addFile,
  deleteFile,
  approveFile,
  rejectFile,
  getAllApprovedFiles,
  getAllUnapprovedFiles,
  getPendingFiles,
  addFileVersion,
  getOfficeCategories,
  addOfficeCategory,
  getFilesByCurrentUser,
} = require('../controllers/fileController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/files'));
  },
  filename: (req, file, cb) => {
    // Replace spaces with underscores in the original filename
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});
const upload = multer({ storage });

// Routes
router.post('/upload', protect, authorize('admin', 'superadmin'), upload.single('file'), addFile);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteFile);
router.put('/:id/approve', protect, authorize('superadmin'), approveFile);
router.put('/:id/reject', protect, authorize('superadmin'), rejectFile);
router.get('/approved', getAllApprovedFiles);
router.get('/unapproved', protect, authorize('admin', 'superadmin'), getAllUnapprovedFiles);
router.get('/pending', protect, authorize('superadmin'), getPendingFiles);
router.post('/:id/version', protect, authorize('admin', 'superadmin'), upload.single('file'), addFileVersion);
router.get('/categories/:office', protect, getOfficeCategories);
router.post('/categories', protect, authorize('admin', 'superadmin'), addOfficeCategory);
router.get('/my-files', protect, authorize('admin', 'superadmin'), getFilesByCurrentUser);
// router.get('/:id/view', protect, viewFile);

// New download endpoint
router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // If it's a URL, redirect to it
    if (file.url) {
      return res.redirect(file.url);
    }

    // For local files, force download
    if (file.filePath) {
      const filePath = path.join(__dirname, '..', file.filePath);
      if (!require('fs').existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'File not found on disk' });
      }
      
      const fileName = path.basename(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file to the client as a download
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      return res.status(404).json({ success: false, error: 'No file path found' });
    }
  } catch (err) {
    console.error(`Error downloading file: ${err.message}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/office/:office', async (req, res) => {
  try {
    const { office } = req.params;
    console.log('Fetching files for office:', office);
    
    const files = await File.find({ 
      office: office,
      status: { $in: ['pending', 'approved'] } 
    }).sort({ createdAt: -1 });

    console.log('Files found:', files.length);
    
    res.status(200).json({ 
      success: true, 
      count: files.length, 
      data: files 
    });
  } catch (err) {
    console.error(`Error fetching office files: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    });
  }
});

router.get('/files/:office', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { office } = req.params;
    console.log('Fetching files for office:', office);
    
    const files = await File.find({ 
      office: office,
      status: { $in: ['pending', 'approved'] } 
    }).sort({ createdAt: -1 });

    console.log('Files found:', files.length);
    
    res.status(200).json({ 
      success: true, 
      count: files.length, 
      data: files 
    });
  } catch (err) {
    console.error(`Error fetching office files: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    });
  }
});

router.get("/:id", async(req, res) => {
  console.log("[API] get /files/:id request received for ID: ", req.params.id);
  try {
    const file = await File.findById(req.params.id).populate('author', 'name');
    if (!file) {
      console.log("[API] file not found in database");
      return res.status(404).json({ success: false, error: "File not found" });
    }
    res.status(200).json({ success: true, data: file });
  }
  catch(err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;