const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Sound = require('../models/Sound');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.mp3', '.wav', '.ogg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all sounds
router.get('/', async (req, res) => {
    try {
        const sounds = await Sound.find().populate('user', 'username');
        res.json(sounds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's sounds
router.get('/user', auth, async (req, res) => {
    try {
        const sounds = await Sound.find({ user: req.user.id });
        res.json(sounds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload a new sound
router.post('/', auth, upload.single('sound'), async (req, res) => {
    try {
        const { title, tags } = req.body;
        const tagArray = tags.split(',').map(tag => tag.trim());

        const sound = new Sound({
            title,
            tags: tagArray,
            fileUrl: `/uploads/${req.file.filename}`,
            user: req.user.id
        });

        await sound.save();
        res.status(201).json(sound);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a sound
router.patch('/:id', auth, async (req, res) => {
    try {
        const sound = await Sound.findById(req.params.id);
        if (!sound) {
            return res.status(404).json({ message: 'Sound not found' });
        }

        // Check if user owns the sound
        if (sound.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, tags } = req.body;
        if (title) sound.title = title;
        if (tags) sound.tags = tags.split(',').map(tag => tag.trim());

        await sound.save();
        res.json(sound);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a sound
router.delete('/:id', auth, async (req, res) => {
    try {
        const sound = await Sound.findById(req.params.id);
        if (!sound) {
            return res.status(404).json({ message: 'Sound not found' });
        }

        // Check if user owns the sound
        if (sound.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', sound.fileUrl);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        await sound.remove();
        res.json({ message: 'Sound deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
