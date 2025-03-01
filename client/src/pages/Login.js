import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, error, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error details:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setFormError(`Login failed: ${err.response.data?.msg || err.response.statusText || 'Server error'}`);
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        setFormError('Login failed: No response from server. Check your connection.');
        console.error('Request error:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setFormError(`Login failed: ${err.message}`);
        console.error('Error message:', err.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Bill Split</h1>
        <h2 className="auth-subtitle">Log in to your account</h2>
        
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="form-button">
            Log In
          </button>
        </form>
        
        <Link to="/register" className="auth-link">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;