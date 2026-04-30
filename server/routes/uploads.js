const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.png';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

router.post('/', auth, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    if (!cloudinaryConfigured) {
        return res.status(201).json({
            message: 'Image uploaded successfully',
            url: `/uploads/${req.file.filename}`,
        });
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: process.env.CLOUDINARY_FOLDER || 'lowcode-builder',
            resource_type: 'image',
        });
        await fs.promises.unlink(req.file.path).catch(() => undefined);

        return res.status(201).json({
            message: 'Image uploaded successfully',
            url: result.secure_url,
        });
    } catch (err) {
        await fs.promises.unlink(req.file.path).catch(() => undefined);
        return res.status(500).json({ message: 'Cloud upload failed' });
    }
});

router.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Image must be smaller than 5MB' });
        }
        return res.status(400).json({ message: err.message });
    }

    return res.status(400).json({ message: err.message || 'Upload failed' });
});

module.exports = router;
