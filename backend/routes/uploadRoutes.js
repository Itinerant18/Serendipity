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
router.post('/product-images', protect, protectSeller, upload.array('files', 7), async (req, res) => {
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

// @desc    Upload profile image (accessible to all authenticated users)
// @route   POST /api/upload/profile-image
// @access  Private (Authenticated Users)
router.post('/profile-image', protect, upload.single('file'), async (req, res) => {
    try {
        console.log('📸 Profile image upload request from user:', req.user?.id);

        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const userId = req.user.id;

        console.log('📁 File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
        });

        // Check file size limits for images
        const maxSize = 5 * 1024 * 1024; // 5MB for profile images

        if (file.size > maxSize) {
            console.log('❌ File too large:', file.size, 'bytes');
            return res.status(400).json({
                message: 'File too large. Maximum size: 5MB'
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.originalname.split('.').pop();
        const filename = `profiles/${userId}-${timestamp}.${ext}`;

        console.log('📝 Uploading to:', filename);

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('product-media') // Reusing the same bucket for now, ideally should differ
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase upload error:', {
                message: error.message,
                statusCode: error.statusCode,
                error: error
            });
            return res.status(500).json({ message: 'Upload failed', error: error.message });
        }

        console.log('✅ Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('product-media')
            .getPublicUrl(filename);

        console.log('🔗 Public URL generated:', urlData.publicUrl);

        res.json({
            success: true,
            url: urlData.publicUrl,
            filename: filename,
            type: 'image',
            size: file.size,
            mimeType: file.mimetype
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Upload review media (image or video)
// @route   POST /api/upload/review-media
// @access  Private (Authenticated Users)
router.post('/review-media', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const userId = req.user.id;
        const productId = req.body.productId; // Optional: organize by product?

        // Check file size limits based on type
        // Plan says: Photos 500KB, Videos 5MB
        const isVideo = file.mimetype.startsWith('video/');
        const maxSize = isVideo ? 5 * 1024 * 1024 : 500 * 1024;

        if (file.size > maxSize) {
            return res.status(400).json({
                message: `File too large. Maximum size: ${isVideo ? '5MB' : '500KB'}`
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = file.originalname.split('.').pop();
        // Path: review-media/{userId}/{timestamp}-{random}.{ext}
        const filename = `review-media/${userId}/${timestamp}-${randomStr}.${ext}`;

        // Upload to Supabase Storage
        // Using 'product-media' bucket for now as shared bucket, or should we create new?
        // Plan mentioned 'review-media' bucket but we might need to stick to existing if permissions logic is same.
        // Let's try 'product-media' bucket first since we know it exists, but use a folder.

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

module.exports = router;
