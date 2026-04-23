import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useStore from '../store/useStore';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useStore();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
                <Link to="/" className="text-accent font-bold text-lg block mb-6">⚡ BuildFlow</Link>
                <h1 className="text-2xl font-bold mb-1">Create account</h1>
                <p className="text-muted text-sm mb-6">Start building for free</p>

                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {[
                        { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name' },
                        { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                    ].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                            <label className="text-sm text-muted mb-1 block">{label}</label>
                            <input
                                type={type}
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent"
                                placeholder={placeholder}
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-muted text-sm text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}