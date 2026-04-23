import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/projects').then(({ data }) => setProjects(data)).finally(() => setLoading(false));
    }, []);

    async function createProject(e) {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const { data } = await api.post('/projects', { name: newName.trim() });
            setProjects([data, ...projects]);
            setNewName('');
            navigate(`/editor/${data._id}`);
        } finally {
            setCreating(false);
        }
    }

    async function deleteProject(id) {
        if (!confirm('Delete this project?')) return;
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter((p) => p._id !== id));
    }

    return (
        <div className="min-h-screen bg-bg">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">My Projects</h1>
                    <form onSubmit={createProject} className="flex gap-2">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New project name..."
                            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent w-52"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newName.trim()}
                            className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {creating ? '...' : '+ Create'}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-muted text-center py-20">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                        <div className="text-4xl mb-3">🏗️</div>
                        <div className="text-muted">No projects yet. Create your first one!</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((p) => (
                            <div
                                key={p._id}
                                className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition group cursor-pointer"
                                onClick={() => navigate(`/editor/${p._id}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-xl">🌐</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteProject(p._id); }}
                                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="font-semibold mb-1 truncate">{p.name}</div>
                                <div className="text-muted text-xs">{p.pages?.length || 0} page(s)</div>
                                <div className="text-muted text-xs mt-1">{new Date(p.updatedAt).toLocaleDateString()}</div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/editor/${p._id}`); }}
                                        className="flex-1 text-xs py-1.5 rounded bg-surface border border-border hover:border-accent text-white transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/preview/${p._id}`); }}
                                        className="flex-1 text-xs py-1.5 rounded bg-surface border border-border hover:border-accent text-white transition"
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}