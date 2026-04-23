import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Navbar() {
    const { user, logout } = useStore();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <nav className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
            <Link to="/dashboard" className="text-accent font-semibold text-lg tracking-tight">
                ⚡ BuildFlow
            </Link>
            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <span className="text-muted text-sm">{user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm px-3 py-1.5 rounded bg-surface border border-border hover:border-accent text-white transition"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}