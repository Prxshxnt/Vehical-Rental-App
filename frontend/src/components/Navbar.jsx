import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        Drive<span>Ease</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          🚗 Fleet
        </NavLink>

        {user ? (
          <>
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              📋 My Bookings
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                ⚙️ Admin
              </NavLink>
            )}
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: '0 0.5rem' }}>
              {user.name}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"  className="btn btn-ghost"  style={{ padding: '0.4rem 0.9rem' }}>Login</NavLink>
            <NavLink to="/signup" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
