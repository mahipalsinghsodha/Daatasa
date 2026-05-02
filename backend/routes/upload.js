const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// ── Configure Cloudinary (add these 3 vars to your .env) ──
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Tell multer to upload straight to Cloudinary ──
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'categories',          // images go into a "categories" folder in your Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }], // optional: cap max width
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB limit

// POST /api/upload
router.post('/', auth, auth.admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        await logAction(req, 'UPLOAD_IMAGE', 'FILE', null, { 
          filename: req.file.originalname, 
          url: req.file.path.slice(-30) // Log partial URL for privacy/brevity
        });

        // Cloudinary gives us req.file.path which is the public HTTPS URL
        res.json({ url: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;