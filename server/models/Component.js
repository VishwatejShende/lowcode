const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        pageId: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['Text', 'Button', 'Image', 'Card', 'Hero', 'Navbar', 'Footer'],
        },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 300 },
        height: { type: Number, default: 100 },
        props: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Component', componentSchema);