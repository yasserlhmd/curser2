/**
 * Navbar Component
 * Navigation bar with authentication state
 * Shows login/register links for guests, user info and logout for authenticated users
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>Task Manager</h1>
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <div className="navbar-user-info">
                <span className="navbar-user-name">
                  {user?.name || user?.email}
                </span>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleLogout}
                className="navbar-logout-btn"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link navbar-link-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

