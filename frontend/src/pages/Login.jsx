import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚗</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your DriveEase account</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input" type="email" name="email"
              placeholder="you@example.com" value={form.email}
              onChange={onChange} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" name="password"
              placeholder="••••••••" value={form.password}
              onChange={onChange} required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
            style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <strong style={{ color: 'var(--text)' }}>Demo:</strong> admin@vehiclerental.com / admin123
        </div>
      </div>
    </div>
  );
}
