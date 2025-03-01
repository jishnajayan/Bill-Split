import React, { useState, useEffect } from 'react';
import { getUserFriends } from '../services/userService';

const FriendsList = ({ userId, friendBalances }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await getUserFriends(userId);
        setFriends(response.user.friends);
        setError(null);
      } catch (err) {
        setError('Failed to load friends');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  if (loading) {
    return <div className="loading-container">Loading friends...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="card empty-state">
        <div className="card-body">
          <p className="empty-message">You don't have any friends yet. Add friends to split bills with them!</p>
          <div className="empty-state-actions">
            <button 
              className="form-button create-bill-btn"
              onClick={() => window.location.href = '/add-friend'}
            >
              Add Your First Friend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-list">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Friends</h3>
        </div>
        <div className="card-body">
          {friends.map((friend) => {
            const balance = friendBalances[friend.friendUserId] || 0;
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : '';
            const formattedBalance = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(Math.abs(balance));
            
            return (
              <div key={friend.friendUserId} className="friend-item">
                <div className="friend-info">
                  <h4 className="friend-name">{friend.friendUsername}</h4>
                </div>
                <div className={`friend-balance ${balanceClass}`}>
                  {balance > 0 
                    ? <span>Owes you {formattedBalance}</span>
                    : balance < 0
                      ? <span>You owe {formattedBalance}</span>
                      : <span className="balance-even">All settled up</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FriendsList;