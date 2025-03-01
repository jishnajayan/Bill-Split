import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { register, error, isAuthenticated } = useContext(AuthContext);
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
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 10) {
      setFormError('Password must be at least 10 characters long');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error details:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setFormError(`Registration failed: ${err.response.data?.msg || err.response.statusText || 'Server error'}`);
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        setFormError('Registration failed: No response from server. Check your connection.');
        console.error('Request error:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setFormError(`Registration failed: ${err.message}`);
        console.error('Error message:', err.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Bill Split</h1>
        <h2 className="auth-subtitle">Create a new account</h2>
        
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
              minLength="10"
            />
            <small className="form-text text-muted">
              Must be at least 10 characters long
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="form-button">
            Register
          </button>
        </form>
        
        <Link to="/login" className="auth-link">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
};

export default Register;