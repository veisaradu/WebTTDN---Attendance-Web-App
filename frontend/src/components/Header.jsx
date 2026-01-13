import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isProfessor } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">📊 Attendance App</h1>
        
        {user ? (
          <div className="header-right">
            <nav className="header-nav">
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>Dashboard</Link>
              <Link to="/events" className={`nav-link ${isActive("/events")}`}>Events</Link>
              <Link to="/history" className={`nav-link ${isActive("/history")}`}>History</Link>
          {isProfessor() && (
              <Link to="/groups" className={`nav-link ${isActive("/groups")}`}>Groups</Link>
          )}
          
            </nav>
            
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${isActive("/")}`}>Home</Link>
          </nav>
        )}
      </div>
    </header>
  );
}