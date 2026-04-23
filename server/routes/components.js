const express = require('express');
const auth = require('../middleware/auth');
const Component = require('../models/Component');
const Project = require('../models/Project');

const router = express.Router();

// Verify project ownership helper
async function verifyProject(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, userId });
    return !!project;
}

// GET /api/components?projectId=&pageId= — get components for a page
router.get('/', auth, async (req, res) => {
    try {
        const { projectId, pageId } = req.query;
        if (!projectId || !pageId) {
            return res.status(400).json({ message: 'projectId and pageId are required' });
        }

        const ok = await verifyProject(projectId, req.userId);
        if (!ok) return res.status(403).json({ message: 'Forbidden' });

        const components = await Component.find({ projectId, pageId });
        res.json(components);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/components/bulk-save — replace all components for a page (auto-save)
router.post('/bulk-save', auth, async (req, res) => {
    try {
        const { projectId, pageId, components } = req.body;

        const ok = await verifyProject(projectId, req.userId);
        if (!ok) return res.status(403).json({ message: 'Forbidden' });

        // Delete existing components for this page
        await Component.deleteMany({ projectId, pageId });

        // Insert new set
        const docs = components.map((c) => ({
            projectId,
            pageId,
            type: c.type,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
            props: c.props,
        }));

        const saved = docs.length > 0 ? await Component.insertMany(docs) : [];
        res.json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/components — create component
router.post('/', auth, async (req, res) => {
    try {
        const { projectId, pageId, type, x, y, width, height, props } = req.body;

        const ok = await verifyProject(projectId, req.userId);
        if (!ok) return res.status(403).json({ message: 'Forbidden' });

        const component = await Component.create({ projectId, pageId, type, x, y, width, height, props });
        res.status(201).json(component);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/components/:id — update component
router.put('/:id', auth, async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);
        if (!component) return res.status(404).json({ message: 'Component not found' });

        const ok = await verifyProject(component.projectId, req.userId);
        if (!ok) return res.status(403).json({ message: 'Forbidden' });

        const updated = await Component.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/components/:id — delete component
router.delete('/:id', auth, async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);
        if (!component) return res.status(404).json({ message: 'Component not found' });

        const ok = await verifyProject(component.projectId, req.userId);
        if (!ok) return res.status(403).json({ message: 'Forbidden' });

        await Component.findByIdAndDelete(req.params.id);
        res.json({ message: 'Component deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;