const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
});

const projectSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        pages: { type: [pageSchema], default: [{ id: 'page-1', name: 'Page 1' }] },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);