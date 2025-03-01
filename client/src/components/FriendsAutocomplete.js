import React, { useState, useEffect, useRef } from 'react';
import { getUserFriends } from '../services/userService';
import './FriendsAutocomplete.css';

const FriendsAutocomplete = ({ userId, onSelectFriend, selectedFriends = [], disabled = false }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await getUserFriends(userId);
        // Filter out already selected friends
        const availableFriends = response.user.friends.filter(
          friend => !selectedFriends.includes(friend.friendUserId)
        );
        setFriends(availableFriends);
        setFilteredFriends(availableFriends);
      } catch (err) {
        console.error('Error fetching friends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId, selectedFriends]);

  // Filter friends when query changes
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend => 
        friend.friendUsername.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
    setActiveIndex(-1);
  }, [query, friends]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectFriend = (friend) => {
    onSelectFriend(friend);
    setQuery('');
    setShowDropdown(false);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => 
        prev < filteredFriends.length - 1 ? prev + 1 : prev
      );
    }
    // Up arrow
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => prev > 0 ? prev - 1 : 0);
    }
    // Enter
    else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectFriend(filteredFriends[activeIndex]);
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="friends-autocomplete">
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-input"
          placeholder="Type to search friends..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
        />
        {loading && <div className="autocomplete-loading">Loading...</div>}
      </div>
      
      {showDropdown && filteredFriends.length > 0 && (
        <ul ref={dropdownRef} className="autocomplete-dropdown">
          {filteredFriends.map((friend, index) => (
            <li 
              key={friend.friendUserId}
              className={`autocomplete-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelectFriend(friend)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {friend.friendUsername}
            </li>
          ))}
        </ul>
      )}
      
      {showDropdown && query && filteredFriends.length === 0 && (
        <div className="autocomplete-no-results">No matching friends found</div>
      )}
    </div>
  );
};

export default FriendsAutocomplete;