import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // If the window is widened to desktop size, reset the menu state
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 992) setOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/');
  }

  function dashboardPath() {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'entrepreneur') return '/entrepreneur-dashboard';
    return '/dashboard';
  }

  return (
    <nav className="navbar navbar-expand-lg hh-navbar py-3">
      <div className="container">
        <Link className="navbar-brand brand-mark" to="/">
          Hunar<span>Hub</span>
        </Link>

        <button
          className={`navbar-toggler border-0 ${open ? '' : 'collapsed'}`}
          type="button"
          aria-controls="hhNav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
          style={{ filter: 'invert(1)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* "show" is controlled by React state instead of Bootstrap's JS */}
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="hhNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/browse">Browse Entrepreneurs</NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to={dashboardPath()}>Dashboard</NavLink>
              </li>
            )}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Log in</NavLink>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-cta btn-sm px-3" to="/register">Join HunarHub</Link>
                </li>
              </>
            )}
            {user && (
              <li className="nav-item">
                <button className="btn btn-cta btn-sm px-3" onClick={handleLogout}>Log out</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}