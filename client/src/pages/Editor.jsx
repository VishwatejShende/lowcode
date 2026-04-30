import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import api from '../lib/api';
import { generateHTML, downloadCode } from '../lib/codeGenerator';
import useStore from '../store/useStore';
import LeftSidebar from '../components/editor/LeftSidebar';
import Canvas from '../components/editor/Canvas';
import RightPanel from '../components/editor/RightPanel';

const DEFAULT_SIZES = {
    Text: { width: 300, height: 60 },
    Button: { width: 160, height: 50 },
    Image: { width: 320, height: 200 },
    Code: { width: 420, height: 180 },
    Card: { width: 280, height: 160 },
    Hero: { width: 700, height: 300 },
    Navbar: { width: 700, height: 64 },
    Input: { width: 300, height: 40 },
    Dropdown: { width: 200, height: 40 },
    Container: { width: 300, height: 200 },
    Grid: { width: 600, height: 300 },
    Footer: { width: 700, height: 64 },
};

function normalizeTree(nodes = []) {
    return nodes.map((node) => ({
        ...node,
        id: node.id || node._id || `cmp-${Date.now()}-${Math.random()}`,
        props: node.props || {},
        children: normalizeTree(node.children || []),
    }));
}

export default function Editor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        currentProject, currentPageId,
        components, setComponents,
        addComponent, updateComponent,
        setCurrentProject, setCurrentPageId,
        undo, history,
    } = useStore();

    const [newPageName, setNewPageName] = useState('');
    const [showAddPage, setShowAddPage] = useState(false);
    const [dragSteps, setDragSteps] = useState([]);
    const [bgUploading, setBgUploading] = useState(false);
    const saveTimer = useRef(null);
    const isDirty = useRef(false);
    const currentPage = currentProject?.pages?.find((p) => p.id === currentPageId);

    // Load project
    useEffect(() => {
        async function load() {
            try {
                const { data: project } = await api.get(`/projects/${projectId}`);
                setCurrentProject(project);
            } catch {
                navigate('/dashboard');
            }
        }
        load();
    }, [projectId]);

    // Load components when page changes
    useEffect(() => {
        if (!currentPageId) return;
        api.get(`/components?projectId=${projectId}&pageId=${currentPageId}`)
            .then(({ data }) => setComponents(normalizeTree(data)));
    }, [currentPageId, projectId]);

    // Auto-save every second if dirty
    useEffect(() => {
        if (saveTimer.current) clearInterval(saveTimer.current);
        saveTimer.current = setInterval(() => {
            if (isDirty.current && currentPageId) {
                isDirty.current = false;
                api.post('/components/bulk-save', {
                    projectId,
                    pageId: currentPageId,
                    components,
                }).catch(console.error);
            }
        }, 1000);
        return () => clearInterval(saveTimer.current);
    }, [components, currentPageId, projectId]);

    // Mark dirty on component changes
    const prevComponents = useRef(components);
    useEffect(() => {
        if (prevComponents.current !== components) {
            isDirty.current = true;
            prevComponents.current = components;
        }
    }, [components]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    function handleDragEnd(event) {
        const { active, over, delta } = event;
        const activeData = active.data.current;

        if (activeData?.fromSidebar) {
            // Drop new component from sidebar
            if (!over || over.id !== 'canvas') return;
            const type = activeData.type;
            const canvasEl = document.getElementById('canvas-area');
            const rect = canvasEl?.getBoundingClientRect() || { left: 0, top: 0 };

            const { width, height } = DEFAULT_SIZES[type] || { width: 200, height: 80 };
            const x = Math.max(0, (event.activatorEvent?.clientX || 100) - rect.left - width / 2);
            const y = Math.max(0, (event.activatorEvent?.clientY || 100) - rect.top - height / 2);

            const tempId = `temp-${Date.now()}`;
            addComponent({ id: tempId, type, x, y, width, height, props: {}, children: [] });
            setDragSteps((prev) => [
                {
                    id: `step-${Date.now()}-${Math.random()}`,
                    text: `Added ${type} to canvas at (${Math.round(x)}, ${Math.round(y)})`,
                    at: new Date().toLocaleTimeString(),
                },
                ...prev,
            ].slice(0, 20));
        } else if (activeData?.fromCanvas) {
            // Move existing component
            const comp = activeData.component;
            const id = comp._id || comp.id;
            updateComponent(id, {
                x: Math.max(0, comp.x + delta.x),
                y: Math.max(0, comp.y + delta.y),
            });
            setDragSteps((prev) => [
                {
                    id: `step-${Date.now()}-${Math.random()}`,
                    text: `Moved ${comp.type} to (${Math.round(comp.x + delta.x)}, ${Math.round(comp.y + delta.y)})`,
                    at: new Date().toLocaleTimeString(),
                },
                ...prev,
            ].slice(0, 20));
        }
    }

    async function updateCurrentPageSettings(updates) {
        if (!currentProject || !currentPageId) return;
        const updatedPages = currentProject.pages.map((p) =>
            p.id === currentPageId ? { ...p, ...updates } : p
        );
        try {
            const { data: updatedProject } = await api.put(`/projects/${projectId}`, { pages: updatedPages });
            setCurrentProject(updatedProject);
        } catch (err) {
            console.error('Failed to update page settings:', err);
        }
    }

    async function handleBackgroundUpload(file) {
        if (!file) return;
        setBgUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await updateCurrentPageSettings({ backgroundMedia: data.url });
        } catch (err) {
            console.error('Background upload failed:', err);
        } finally {
            setBgUploading(false);
        }
    }

    async function handleAddPage() {
        if (!newPageName.trim()) return;
        try {
            const { data: updatedProject } = await api.post(`/projects/${projectId}/pages`, {
                name: newPageName,
            });
            setCurrentProject(updatedProject);
            setCurrentPageId(updatedProject.pages[updatedProject.pages.length - 1].id);
            setNewPageName('');
            setShowAddPage(false);
        } catch (err) {
            console.error('Failed to add page:', err);
        }
    }

    async function handleDeletePage(pageId) {
        if (!confirm('Delete this page?')) return;
        try {
            const updatedPages = currentProject.pages.filter(p => p.id !== pageId);
            await api.put(`/projects/${projectId}`, { pages: updatedPages });
            setCurrentProject({ ...currentProject, pages: updatedPages });
            if (currentPageId === pageId && updatedPages.length > 0) {
                setCurrentPageId(updatedPages[0].id);
            }
        } catch (err) {
            console.error('Failed to delete page:', err);
        }
    }

    function handleDownloadCode() {
        const html = generateHTML(currentProject, currentPageId, components);
        downloadCode(html, `${currentProject.name.replace(/\s+/g, '-')}.html`);
    }

    async function handleUndo() {
        undo();
        const state = useStore.getState();

        try {
            if (state.currentProject?.pages) {
                await api.put(`/projects/${projectId}`, { pages: state.currentProject.pages });
            }
            if (state.currentPageId) {
                await api.post('/components/bulk-save', {
                    projectId,
                    pageId: state.currentPageId,
                    components: state.components,
                });
            }
        } catch (err) {
            console.error('Failed to persist undo state:', err);
        }
    }

    return (
        <div className="h-screen flex flex-col bg-bg overflow-hidden">
            {/* Top bar */}
            <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="text-muted hover:text-white text-sm transition">← Dashboard</Link>
                    <span className="text-border">|</span>
                    <span className="text-sm font-semibold truncate max-w-xs">{currentProject?.name || '...'}</span>
                </div>

                {/* Page tabs */}
                <div className="flex items-center gap-1">
                    {currentProject?.pages?.map((page) => (
                        <div key={page.id} className="relative group">
                            <button
                                onClick={() => setCurrentPageId(page.id)}
                                className={`px-3 py-1 text-xs rounded transition ${currentPageId === page.id
                                        ? 'bg-accent text-white'
                                        : 'text-muted hover:text-white border border-border hover:border-accent'
                                    }`}
                            >
                                {page.name}
                            </button>
                            {currentProject.pages.length > 1 && (
                                <button
                                    onClick={() => handleDeletePage(page.id)}
                                    className="absolute -top-7 right-0 hidden group-hover:block text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {!showAddPage ? (
                        <button
                            onClick={() => setShowAddPage(true)}
                            className="px-2 py-1 text-xs text-muted hover:text-accent border border-border hover:border-accent rounded transition"
                        >
                            + Add Page
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            <input
                                type="text"
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                                placeholder="Page name..."
                                autoFocus
                                className="px-2 py-1 text-xs rounded bg-surface border border-accent text-white focus:outline-none w-32"
                            />
                            <button
                                onClick={handleAddPage}
                                className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover transition"
                            >
                                ✓
                            </button>
                            <button
                                onClick={() => { setShowAddPage(false); setNewPageName(''); }}
                                className="px-2 py-1 text-xs text-muted hover:text-white border border-border rounded transition"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={currentPage?.backgroundColor || '#0f1117'}
                        onChange={(e) => updateCurrentPageSettings({ backgroundColor: e.target.value })}
                        title="Page background color"
                        className="w-8 h-8 rounded border border-border bg-transparent p-0.5 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={currentPage?.backgroundMedia || ''}
                        onChange={(e) => updateCurrentPageSettings({ backgroundMedia: e.target.value })}
                        placeholder="Background image/GIF URL"
                        className="px-2 py-1.5 text-xs rounded bg-surface border border-border text-white focus:outline-none w-52"
                    />
                    <label className="px-2 py-1.5 text-xs border border-border rounded text-muted hover:text-white cursor-pointer">
                        {bgUploading ? 'Uploading...' : 'Upload BG'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleBackgroundUpload(file);
                                e.target.value = '';
                            }}
                        />
                    </label>
                    <button
                        onClick={handleDownloadCode}
                        className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                        title="Download HTML code"
                    >
                        ⬇️ Code
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`px-3 py-1.5 text-xs rounded font-semibold transition ${history.length === 0
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                        title="Undo last change"
                    >
                        ↶ Undo
                    </button>
                    <span className="text-xs text-muted font-mono">Auto-saving...</span>
                    <Link
                        to={`/preview/${projectId}`}
                        target="_blank"
                        className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover text-white rounded font-semibold transition"
                    >
                        Preview ↗
                    </Link>
                </div>
            </header>

            {/* Main editor area */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
                <div className="flex flex-1 overflow-hidden">
                    <LeftSidebar />
                    <div id="canvas-area" className="flex-1 overflow-auto relative">
                        <Canvas />
                    </div>
                    <RightPanel />
                </div>
            </DndContext>
            <div className="absolute bottom-3 left-60 w-96 max-h-48 overflow-auto bg-card/95 border border-border rounded-lg p-3">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Drag & Drop Steps</div>
                {dragSteps.length === 0 ? (
                    <div className="text-xs text-muted">No actions yet. Start dragging components.</div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {dragSteps.map((step, idx) => (
                            <div key={step.id} className="text-xs text-slate-200">
                                <span className="text-accent mr-1">{dragSteps.length - idx}.</span>
                                {step.text}
                                <span className="text-muted ml-2">({step.at})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}