const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') });
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Route files
const announcements = require('./routes/announcements');
const quickLinks = require('./routes/quicklinks');
const auth = require('./routes/auth_cas');
const faqs = require('./routes/faqs');
const files = require('./routes/files');
const portals = require('./routes/portals');
const officesRoutes = require('./routes/offices');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS (Updated configuration)
const allowedOrigins = [
  'http://localhost:5173',  // Frontend 1
  'http://localhost:3000',  // Frontend 2 (or another URL)
  process.env.CLIENT_URL   // From environment variables
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Accept the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth_cas', auth);
app.use('/api/announcements', announcements);
app.use('/api/quicklinks', quickLinks);
app.use('/api/faqs', faqs);
app.use('/api/files', files);
app.use('/api/portals', portals);
app.use('/api/offices', officesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum file size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Catch-all route handler for undefined routes
app.use((req, res) => {
  console.log(`[UNHANDLED ROUTE] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;