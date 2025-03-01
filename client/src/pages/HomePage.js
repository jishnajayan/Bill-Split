import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">Split Bills Easily with Friends</h1>
          <p className="hero-subtitle">
            Track who owes what, settle up, and make splitting bills hassle-free.
          </p>
          
          {isAuthenticated ? (
            <Link to="/dashboard" className="hero-button">
              Go to Dashboard
            </Link>
          ) : (
            <div className="hero-buttons">
              <Link to="/login" className="hero-button">
                Log In
              </Link>
              <Link to="/register" className="hero-button hero-button-secondary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
        
        <div className="features-section">
          <div className="feature-card">
            <h2>Track Expenses</h2>
            <p>
              Keep track of who paid for what and who owes whom.
            </p>
          </div>
          
          <div className="feature-card">
            <h2>Split Bills</h2>
            <p>
              Split bills evenly or let people claim specific items.
            </p>
          </div>
          
          <div className="feature-card">
            <h2>Manage Friends</h2>
            <p>
              Add friends and easily split expenses with them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;