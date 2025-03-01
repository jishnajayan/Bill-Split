import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Function to check if a route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Bill Split
        </Link>
        
        {/* Mobile menu toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className="menu-icon"></span>
        </button>

        <div className={`navbar-nav${mobileMenuOpen ? ' mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <div className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}
                >
                  Dashboard
                </Link>
              </div>
              <div className="nav-item">
                <Link 
                  to="/add-friend" 
                  className={`nav-link${isActive('/add-friend') ? ' active' : ''}`}
                >
                  Friends
                </Link>
              </div>
              <div className="nav-item">
                <Link 
                  to="/add-bill" 
                  className={`nav-link${isActive('/add-bill') ? ' active' : ''}`}
                >
                  New Bill
                </Link>
              </div>
              <div className="nav-divider"></div>
              <div className="nav-item user-menu">
                <span className="user-greeting">Hi, {user.name}</span>
                <button onClick={handleLogout} className="nav-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link${isActive('/login') ? ' active' : ''}`}
                >
                  Login
                </Link>
              </div>
              <div className="nav-item">
                <Link 
                  to="/register" 
                  className={`nav-link${isActive('/register') ? ' active' : ''}`}
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;