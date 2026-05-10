const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/properties'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `property_${Date.now()}_${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Middleware for multiple image uploads
const uploadPropertyImages = upload.array('images', 10);

// Middleware for single image upload
const uploadPropertyImage = upload.single('image');

// Utility function to get image URL
const getImageUrl = (filename) => {
  const base = (process.env.API_BASE_URL || '').replace(/\/$/, '');
  return `${base}/uploads/properties/${filename}`;
};

// Utility function to remove image
const fs = require('fs');
const removeImage = (filename) => {
  const filePath = path.join(__dirname, '../uploads/properties', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Utility to validate image dimensions (optional)
const validateImageDimensions = (filePath, minWidth = 800, minHeight = 600) => {
  return new Promise((resolve, reject) => {
    // This would require an image processing library like 'sharp' or 'jimp'
    // For now, we'll just resolve true
    resolve(true);
  });
};

module.exports = {
  uploadPropertyImages,
  uploadPropertyImage,
  getImageUrl,
  removeImage,
  validateImageDimensions
};
