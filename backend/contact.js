const mongoose = require('mongoose');

const categories = ['Family', 'Friends', 'Work', 'Other'];

const ContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: categories,
        default: 'Other'
    }
}, { timestamps: true })

ContactSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', ContactSchema);
