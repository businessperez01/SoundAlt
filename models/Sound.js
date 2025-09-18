const mongoose = require('mongoose');

const SoundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sound', SoundSchema);
