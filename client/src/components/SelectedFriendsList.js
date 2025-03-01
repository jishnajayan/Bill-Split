import React from 'react';
import './FriendsAutocomplete.css';

const SelectedFriendsList = ({ selectedFriends, onRemoveFriend, disabled = false }) => {
  if (!selectedFriends || selectedFriends.length === 0) {
    return <div className="no-selected-friends">No friends selected</div>;
  }

  return (
    <div className="selected-friends">
      {selectedFriends.map(friend => (
        <div key={friend.friendUserId} className="selected-friend-tag">
          {friend.friendUsername}
          {!disabled && (
            <button 
              type="button" 
              className="remove-friend-btn" 
              onClick={() => onRemoveFriend(friend)}
              aria-label={`Remove ${friend.friendUsername}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SelectedFriendsList;