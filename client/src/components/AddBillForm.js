import React, { useState, useEffect } from 'react';
import { createBill } from '../services/billService';
import { getUserFriends } from '../services/userService';
import FriendsAutocomplete from './FriendsAutocomplete';
import SelectedFriendsList from './SelectedFriendsList';

const AddBillForm = ({ userId, onBillAdded }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [items, setItems] = useState([{ name: '', price: '', claimedBy: [] }]);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]); // Now stores friend objects, not just IDs
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setFriendsLoading(true);
        const response = await getUserFriends(userId);
        setFriends(response.user.friends);
      } catch (err) {
        console.error('Error fetching friends:', err);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '', claimedBy: [] }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleItemClaimToggle = (itemIndex, userId) => {
    const newItems = [...items];
    const claimedBy = newItems[itemIndex].claimedBy || [];
    
    const userIndex = claimedBy.indexOf(userId);
    if (userIndex === -1) {
      // Add user to claimedBy
      claimedBy.push(userId);
    } else {
      // Remove user from claimedBy
      claimedBy.splice(userIndex, 1);
    }
    
    newItems[itemIndex].claimedBy = claimedBy;
    setItems(newItems);
  };

  const handleAddFriend = (friend) => {
    // Only add friend if not already in the list
    if (!selectedFriends.some(f => f.friendUserId === friend.friendUserId)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleRemoveFriend = (friend) => {
    // Remove friend from selected list
    setSelectedFriends(selectedFriends.filter(f => f.friendUserId !== friend.friendUserId));
    
    // Also remove any claims by this friend
    const newItems = items.map(item => ({
      ...item,
      claimedBy: (item.claimedBy || []).filter(id => id !== friend.friendUserId)
    }));
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!restaurantName.trim()) {
      setError('Please enter a restaurant name');
      return;
    }
    
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    
    if (selectedFriends.length === 0) {
      setError('Please select at least one friend to split the bill with');
      return;
    }
    
    const invalidItems = items.filter(item => !item.name.trim() || !item.price || isNaN(parseFloat(item.price)));
    if (invalidItems.length > 0) {
      setError('Please fill in name and price for all items');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Format items for API
      const formattedItems = items.map(item => ({
        name: item.name,
        price: parseFloat(item.price),
        claimedBy: item.claimedBy || []
      }));
      
      // Extract user IDs from selected friends
      const friendIds = selectedFriends.map(friend => friend.friendUserId);
      
      // Include current user in participants
      const participants = [...friendIds];
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      
      const billData = {
        restaurantName,
        totalAmount: totalAmount || calculateTotal(),
        items: formattedItems,
        participants
      };
      
      await createBill(billData);
      setSuccess('Bill created successfully!');
      
      // Reset form
      setRestaurantName('');
      setTotalAmount('');
      setItems([{ name: '', price: '', claimedBy: [] }]);
      setSelectedFriends([]);
      
      // Notify parent component
      if (onBillAdded) {
        onBillAdded();
      }
    } catch (err) {
      console.error('Error creating bill:', err);
      setError(err.response?.data?.msg || 'Failed to create bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get a map of selected friend ID to username for easier reference
  const selectedFriendMap = selectedFriends.reduce((map, friend) => {
    map[friend.friendUserId] = friend.friendUsername;
    return map;
  }, {});

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Create a New Bill</h3>
      </div>
      <div className="card-body">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="restaurantName" className="form-label">Restaurant Name</label>
            <input
              type="text"
              id="restaurantName"
              className="form-input"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Enter restaurant name"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Select Friends</label>
            {friendsLoading ? (
              <div>Loading friends...</div>
            ) : friends.length === 0 ? (
              <div>You don't have any friends yet. Add friends to split bills.</div>
            ) : (
              <>
                <FriendsAutocomplete 
                  userId={userId}
                  selectedFriends={selectedFriends.map(f => f.friendUserId)}
                  onSelectFriend={handleAddFriend}
                  disabled={loading}
                />
                
                <SelectedFriendsList
                  selectedFriends={selectedFriends}
                  onRemoveFriend={handleRemoveFriend}
                  disabled={loading}
                />
              </>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Items</label>
            {items.map((item, index) => (
              <div key={index} className="bill-item">
                <div className="item-header">
                  <h4>Item {index + 1}</h4>
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-icon" 
                      onClick={() => handleRemoveItem(index)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="item-inputs">
                  <input
                    type="text"
                    className="form-input"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Item name"
                    disabled={loading}
                    required
                  />
                  
                  <input
                    type="number"
                    className="form-input"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    disabled={loading}
                    required
                  />
                </div>
                
                {selectedFriends.length > 0 && (
                  <div className="item-claims">
                    <label className="form-label">Who's claiming this item?</label>
                    <div className="claims-container">
                      {selectedFriends.map(friend => (
                        <div key={friend.friendUserId} className="claim-checkbox">
                          <input
                            type="checkbox"
                            id={`item-${index}-friend-${friend.friendUserId}`}
                            checked={(item.claimedBy || []).includes(friend.friendUserId)}
                            onChange={() => handleItemClaimToggle(index, friend.friendUserId)}
                            disabled={loading}
                          />
                          <label htmlFor={`item-${index}-friend-${friend.friendUserId}`}>
                            {friend.friendUsername}
                          </label>
                        </div>
                      ))}
                      
                      {/* Allow current user to claim items too */}
                      <div className="claim-checkbox">
                        <input
                          type="checkbox"
                          id={`item-${index}-friend-${userId}`}
                          checked={(item.claimedBy || []).includes(userId)}
                          onChange={() => handleItemClaimToggle(index, userId)}
                          disabled={loading}
                        />
                        <label htmlFor={`item-${index}-friend-${userId}`}>
                          You
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              className="form-button secondary"
              onClick={handleAddItem}
              disabled={loading}
            >
              Add Another Item
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="totalAmount" className="form-label">Total Amount (Optional)</label>
            <input
              type="number"
              id="totalAmount"
              className="form-input"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder={`Calculated: $${calculateTotal().toFixed(2)}`}
              step="0.01"
              min="0"
              disabled={loading}
            />
            <small className="form-help-text">
              If left empty, we'll use the sum of item prices: ${calculateTotal().toFixed(2)}
            </small>
          </div>
          
          <button type="submit" className="form-button" disabled={loading || friendsLoading}>
            {loading ? 'Creating Bill...' : 'Create Bill'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBillForm;