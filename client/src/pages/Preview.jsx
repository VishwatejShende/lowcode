import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import BlockRenderer from '../components/rendered/BlockRenderer';

export default function Preview() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [pageId, setPageId] = useState(null);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/projects/${projectId}`)
            .then(({ data }) => {
                setProject(data);
                const firstPage = data.pages?.[0]?.id;
                setPageId(firstPage);
            })
            .catch(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (!pageId) return;
        api.get(`/components?projectId=${projectId}&pageId=${pageId}`)
            .then(({ data }) => { setComponents(data); setLoading(false); });
    }, [pageId, projectId]);

    const canvasHeight = components.reduce((max, c) => Math.max(max, c.y + c.height + 40), 600);

    return (
        <div style={{ minHeight: '100vh', background: '#0f1117', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>
            {/* Preview bar */}
            <div style={{ height: 40, background: '#1c2028', borderBottom: '1px solid #2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Preview:</span>
                    <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{project?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {project?.pages?.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPageId(p.id)}
                            style={{
                                fontSize: 11, padding: '2px 10px', borderRadius: 4, border: '1px solid',
                                borderColor: pageId === p.id ? '#388bfd' : '#2a2f3a',
                                background: pageId === p.id ? '#388bfd20' : 'transparent',
                                color: pageId === p.id ? '#388bfd' : '#6b7280',
                                cursor: 'pointer',
                            }}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
                <Link
                    to={`/editor/${projectId}`}
                    style={{ fontSize: 11, color: '#388bfd', textDecoration: 'none' }}
                >
                    ← Back to Editor
                </Link>
            </div>

            {/* Canvas */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#6b7280' }}>
                    Loading...
                </div>
            ) : (
                <div style={{ position: 'relative', minHeight: canvasHeight, width: '100%' }}>
                    {components.map((c) => (
                        <BlockRenderer key={c._id} component={c} />
                    ))}
                    {components.length === 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#6b7280', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 40 }}>🏜️</div>
                            <div>This page is empty. Add components in the editor.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}