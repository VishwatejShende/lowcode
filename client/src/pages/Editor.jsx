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
    Card: { width: 280, height: 160 },
    Hero: { width: 700, height: 300 },
    Navbar: { width: 700, height: 64 },
    Input: { width: 300, height: 40 },
    Dropdown: { width: 200, height: 40 },
    Container: { width: 300, height: 200 },
    Grid: { width: 600, height: 300 },
    Footer: { width: 700, height: 64 },
};

export default function Editor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        currentProject, currentPageId,
        components, setComponents,
        addComponent, updateComponent,
        setCurrentProject, setCurrentPageId,
    } = useStore();

    const [newPageName, setNewPageName] = useState('');
    const [showAddPage, setShowAddPage] = useState(false);
    const saveTimer = useRef(null);
    const isDirty = useRef(false);

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
            .then(({ data }) => setComponents(data));
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
        if (!over) return;

        const activeData = active.data.current;

        if (activeData?.fromSidebar) {
            // Drop new component from sidebar
            if (over.id !== 'canvas') return;
            const type = activeData.type;
            const canvasEl = document.getElementById('canvas-area');
            const rect = canvasEl?.getBoundingClientRect() || { left: 0, top: 0 };

            const { width, height } = DEFAULT_SIZES[type] || { width: 200, height: 80 };
            const x = Math.max(0, (event.activatorEvent?.clientX || 100) - rect.left - width / 2);
            const y = Math.max(0, (event.activatorEvent?.clientY || 100) - rect.top - height / 2);

            const tempId = `temp-${Date.now()}`;
            addComponent({ id: tempId, type, x, y, width, height, props: {} });
        } else if (activeData?.fromCanvas) {
            // Move existing component
            const comp = activeData.component;
            const id = comp._id || comp.id;
            updateComponent(id, {
                x: Math.max(0, comp.x + delta.x),
                y: Math.max(0, comp.y + delta.y),
            });
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
                    <button
                        onClick={handleDownloadCode}
                        className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                        title="Download HTML code"
                    >
                        ⬇️ Code
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
        </div>
    );
}