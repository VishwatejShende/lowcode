import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <nav className="h-16 border-b border-border flex items-center justify-between px-10">
                <span className="text-accent font-bold text-xl">⚡ BuildFlow</span>
                <div className="flex gap-3">
                    <Link to="/login" className="px-4 py-2 text-sm text-white border border-border rounded hover:border-accent transition">Login</Link>
                    <Link to="/register" className="px-4 py-2 text-sm bg-accent text-white rounded hover:bg-accent-hover transition">Get Started</Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-accent/10 text-accent border border-accent/30">
                    Low-Code · Drag & Drop · Instant Deploy
                </div>
                <h1 className="text-6xl font-bold leading-tight max-w-3xl">
                    Build websites<br />
                    <span className="text-accent">without writing code</span>
                </h1>
                <p className="text-muted text-lg max-w-xl">
                    Drag components onto a canvas, customize them visually, and publish in seconds.
                    BuildFlow is your visual development environment.
                </p>
                <Link
                    to="/register"
                    className="px-8 py-3 bg-accent text-white rounded-lg font-semibold text-lg hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                >
                    Start Building Free →
                </Link>

                <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl text-left">
                    {[
                        { icon: '🧩', title: 'Drag & Drop', desc: 'Place components anywhere on the canvas with intuitive drag-and-drop.' },
                        { icon: '🎨', title: 'Visual Editor', desc: 'Edit text, colors, sizes and styles in a live right-side panel.' },
                        { icon: '💾', title: 'Auto-Save', desc: 'Your layout is saved to the database every second, automatically.' },
                    ].map((f) => (
                        <div key={f.title} className="bg-card border border-border rounded-xl p-5">
                            <div className="text-2xl mb-2">{f.icon}</div>
                            <div className="font-semibold mb-1">{f.title}</div>
                            <div className="text-muted text-sm">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}