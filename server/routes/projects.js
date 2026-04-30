const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Component = require('../models/Component');

const router = express.Router();

// GET /api/projects — list user's projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/projects — create project
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Project name is required' });

        const project = await Project.create({
            userId: req.userId,
            name,
            pages: [{ id: `page-${Date.now()}`, name: 'Page 1', backgroundColor: '#0f1117', backgroundMedia: '' }],
        });

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/projects/:id — get single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/projects/:id — update project (name, pages)
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/projects/:id — delete project and its components
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Remove all components belonging to this project
        await Component.deleteMany({ projectId: req.params.id });

        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/projects/:id/pages — add page
router.post('/:id/pages', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newPage = {
            id: `page-${Date.now()}`,
            name: name || `Page ${project.pages.length + 1}`,
            backgroundColor: '#0f1117',
            backgroundMedia: '',
        };
        project.pages.push(newPage);
        await project.save();

        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;