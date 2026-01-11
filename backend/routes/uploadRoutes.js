const express = require('express');
const multer = require('multer');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { protectSeller } = require('../middleware/sellerMiddleware');

// Configure multer for memory storage (files stored in memory buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Allowed mime types
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    }
});

// @desc    Upload product media (image or video)
// @route   POST /api/upload/product-media
// @access  Private (Seller)
router.post('/product-media', protect, protectSeller, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const userId = req.user.id;

        // Check file size limits based on type
        const isVideo = file.mimetype.startsWith('video/');
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images

        if (file.size > maxSize) {
            return res.status(400).json({
                message: `File too large. Maximum size: ${isVideo ? '100MB' : '10MB'}`
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = file.originalname.split('.').pop();
        const filename = `${userId}/${timestamp}-${randomStr}.${ext}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('product-media')
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ message: 'Upload failed', error: error.message });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('product-media')
            .getPublicUrl(filename);

        res.json({
            success: true,
            url: urlData.publicUrl,
            filename: filename,
            type: isVideo ? 'video' : 'image',
            size: file.size,
            mimeType: file.mimetype
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Upload multiple product images
// @route   POST /api/upload/product-images
// @access  Private (Seller)
router.post('/product-images', protect, protectSeller, upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const userId = req.user.id;
        const uploadedFiles = [];
        const errors = [];

        for (const file of req.files) {
            try {
                // Check if it's an image
                if (!file.mimetype.startsWith('image/')) {
                    errors.push({ filename: file.originalname, error: 'Only images allowed for multiple upload' });
                    continue;
                }

                // Check size (10MB for images)
                if (file.size > 10 * 1024 * 1024) {
                    errors.push({ filename: file.originalname, error: 'File too large (max 10MB)' });
                    continue;
                }

                // Generate unique filename
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(7);
                const ext = file.originalname.split('.').pop();
                const filename = `${userId}/${timestamp}-${randomStr}.${ext}`;

                // Upload to Supabase Storage
                const { data, error } = await supabaseAdmin.storage
                    .from('product-media')
                    .upload(filename, file.buffer, {
                        contentType: file.mimetype,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    errors.push({ filename: file.originalname, error: error.message });
                    continue;
                }

                // Get public URL
                const { data: urlData } = supabaseAdmin.storage
                    .from('product-media')
                    .getPublicUrl(filename);

                uploadedFiles.push({
                    url: urlData.publicUrl,
                    filename: filename,
                    originalName: file.originalname,
                    size: file.size
                });

            } catch (err) {
                errors.push({ filename: file.originalname, error: err.message });
            }
        }

        res.json({
            success: uploadedFiles.length > 0,
            files: uploadedFiles,
            errors: errors.length > 0 ? errors : undefined,
            totalUploaded: uploadedFiles.length,
            totalFailed: errors.length
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/product-media
// @access  Private (Seller)
router.delete('/product-media', protect, protectSeller, async (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ message: 'Filename is required' });
        }

        // Verify the file belongs to this user (filename starts with userId)
        if (!filename.startsWith(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }

        const { error } = await supabaseAdmin.storage
            .from('product-media')
            .remove([filename]);

        if (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ message: 'Delete failed', error: error.message });
        }

        res.json({ success: true, message: 'File deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
