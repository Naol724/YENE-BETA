const { uploadPropertyImages, uploadPropertyImage, getImageUrl, removeImage } = require('../utils/imageUpload');
const path = require('path');
const fs = require('fs');

// @desc    Upload property images
// @route   POST /api/upload/property-images
// @access  Private (Owner/Admin)
exports.uploadPropertyImages = async (req, res) => {
  try {
    // Check if user is authorized
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can upload property images'
      });
    }

    // Use multer middleware
    uploadPropertyImages(req, res, function (err) {
      if (err) {
        console.error('Image upload error:', err);
        
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB per image.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum 10 images allowed.'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name. Use "images" field.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'Failed to upload images'
        });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      // Process uploaded files
      const uploadedImages = req.files.map((file, index) => ({
        url: getImageUrl(file.filename),
        public_id: file.filename,
        isMain: index === 0, // First image is main by default
        caption: '',
        uploadedAt: new Date()
      }));

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages
      });
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// @desc    Upload single property image
// @route   POST /api/upload/property-image
// @access  Private (Owner/Admin)
exports.uploadPropertyImage = async (req, res) => {
  try {
    // Check if user is authorized
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can upload property images'
      });
    }

    uploadPropertyImage(req, res, function (err) {
      if (err) {
        console.error('Single image upload error:', err);
        
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'Failed to upload image'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const uploadedImage = {
        url: getImageUrl(req.file.filename),
        public_id: req.file.filename,
        isMain: false,
        caption: '',
        uploadedAt: new Date()
      };

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: uploadedImage
      });
    });
  } catch (error) {
    console.error('Single upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// @desc    Delete property image
// @route   DELETE /api/upload/property-image/:filename
// @access  Private (Owner/Admin)
exports.deletePropertyImage = async (req, res) => {
  try {
    // Check if user is authorized
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can delete property images'
      });
    }

    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Check if file exists
    const filePath = path.join(__dirname, '../uploads/properties', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Remove the file
    removeImage(filename);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

// @desc    Get uploaded image
// @route   GET /api/uploads/properties/:filename
// @access  Public
exports.getPropertyImage = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../uploads/properties', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image'
    });
  }
};
