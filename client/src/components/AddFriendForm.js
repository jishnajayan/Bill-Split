import React, { useState } from 'react';
import { addFriend } from '../services/userService';

const AddFriendForm = ({ userId, onFriendAdded }) => {
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!friendEmail.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await addFriend(userId, friendEmail);
      setSuccess(`Friend request sent to ${friendEmail}`);
      setFriendEmail('');
      
      // Notify parent component about the successful addition
      if (onFriendAdded) {
        onFriendAdded();
      }
    } catch (err) {
      console.error('Error adding friend:', err);
      setError(err.response?.data?.msg || 'Failed to add friend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add a Friend</h3>
      </div>
      <div className="card-body">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="friendEmail" className="form-label">Friend's Email</label>
            <input
              type="email"
              id="friendEmail"
              className="form-input"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Enter your friend's email address"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Friend'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFriendForm;