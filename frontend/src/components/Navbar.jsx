import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
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
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#hhNav" style={{ filter: 'invert(1)' }}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="hhNav">
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
