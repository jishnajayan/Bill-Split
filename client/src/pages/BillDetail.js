import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBillById, updateBill } from '../services/billService';
import { getUser, getUserFriends } from '../services/userService';
import { AuthContext } from '../context/AuthContext';

const BillDetail = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const billType = queryParams.get('type') || 'incoming';
  
  const { user } = useContext(AuthContext);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [participantDetails, setParticipantDetails] = useState({});

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const response = await getBillById(billId);
        setBill(response);
        
        // Initialize selected items based on the existing claims
        const initialSelections = {};
        response.items.forEach(item => {
          if (item.claimedBy && item.claimedBy.includes(user.id)) {
            initialSelections[item.itemId] = true;
          } else {
            initialSelections[item.itemId] = false;
          }
        });
        setSelectedItems(initialSelections);
        
        // Fetch participant details
        await fetchParticipantDetails(response.participants);
        
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError('Could not load bill details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchParticipantDetails = async (participantIds) => {
      const details = {};
      
      try {
        // First, get the current user's friends to see if participants are friends
        const friendsResponse = await getUserFriends(user.id);
        const userFriends = friendsResponse.user.friends || [];
        
        // Create a map of friend IDs to friend objects
        const friendsMap = {};
        userFriends.forEach(friend => {
          friendsMap[friend.friendUserId] = {
            id: friend.friendUserId,
            name: friend.friendUsername,
            isFriend: true
          };
        });
        
        // Add current user to the details
        details[user.id] = {
          id: user.id,
          name: 'You (Current User)',
          isSelf: true
        };
        
        // For each participant that's not the current user or a friend, fetch details from API
        const unknownParticipants = participantIds.filter(id => 
          id !== user.id && !friendsMap[id]
        );
        
        if (unknownParticipants.length > 0) {
          // Fetch details for unknown participants
          const participantPromises = unknownParticipants.map(async (id) => {
            try {
              const userData = await getUser(id);
              return { 
                id, 
                name: userData.name,
                email: userData.email
              };
            } catch (err) {
              console.error(`Error fetching user ${id}:`, err);
              return { 
                id, 
                name: `User ${id.substring(0, 6)}...`,
                isUnknown: true 
              };
            }
          });
          
          const fetchedParticipants = await Promise.all(participantPromises);
          
          // Add fetched users to the details map
          fetchedParticipants.forEach(participant => {
            details[participant.id] = participant;
          });
        }
        
        // Add known friends to the details
        participantIds.forEach(id => {
          if (friendsMap[id]) {
            details[id] = friendsMap[id];
          }
        });
        
        setParticipantDetails(details);
      } catch (err) {
        console.error('Error fetching participant details:', err);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId, user.id]);

  const handleItemToggle = (itemId, e) => {
    // Only allow toggling if this is an incoming bill
    if (billType === 'incoming') {
      // If the event is from a checkbox or its label, don't do anything
      // as the onChange handler will handle it
      if (e && (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL')) {
        return;
      }
      
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSavingChanges(true);
      
      // Create a list of items with updated claims
      const updatedItems = bill.items.map(item => {
        // Get the current list of claimants
        let claimants = [...(item.claimedBy || [])];
        
        // If the item is selected now but the user is not in the claimants, add them
        if (selectedItems[item.itemId] && !claimants.includes(user.id)) {
          claimants.push(user.id);
        } 
        // If the item is not selected but the user is in the claimants, remove them
        else if (!selectedItems[item.itemId] && claimants.includes(user.id)) {
          claimants = claimants.filter(id => id !== user.id);
        }
        
        return {
          ...item,
          claimedBy: claimants
        };
      });
      
      // Prepare update data for the bill
      const updateData = { items: updatedItems };
      
      // Check if bill should be marked as resolved (only if creator)
      const isCreator = bill.paymentUserId === user.id;
      
      // Check if after our update, all items will be claimed and all participants have claimed
      const willAllItemsBeClaimed = updatedItems.every(item => item.claimedBy && item.claimedBy.length > 0);
      
      // If all conditions are met and the bill isn't already resolved, mark it as resolved
      if (isCreator && willAllItemsBeClaimed && !bill.resolved) {
        // Only the bill creator can set resolved status
        updateData.resolved = true;
      }
      
      // Update the bill with the new item claims and possibly resolved status
      const updatedBill = await updateBill(billId, updateData);
      
      // If the bill was updated to resolved status, show appropriate message
      const wasResolved = !bill.resolved && updatedBill.resolved;
      const resolvedText = wasResolved ? 
        ' All items are now claimed, so the bill has been automatically marked as resolved!' : '';
      
      // Navigate back to the dashboard with a success message
      navigate('/dashboard', { 
        state: { 
          successMessage: `Your item selections have been saved!${resolvedText}`
        } 
      });
      
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save your changes. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  const handleMarkAsResolved = async () => {
    try {
      setSavingChanges(true);
      
      // Only the bill creator can mark a bill as resolved
      if (bill.paymentUserId !== user.id) {
        setError('Only the bill creator can mark a bill as resolved');
        return;
      }
      
      // Update the bill to set it as resolved
      const updatedBill = await updateBill(billId, { resolved: true });
      
      // Navigate back to the dashboard with a success message
      navigate('/dashboard', {
        state: {
          successMessage: 'The bill has been marked as resolved!'
        }
      });
      
    } catch (err) {
      console.error('Error marking bill as resolved:', err);
      setError('Failed to mark bill as resolved. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading bill details...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="error-message">{error}</div>
        <button className="form-button secondary" onClick={handleGoBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="error-message">Bill not found</div>
        <button className="form-button secondary" onClick={handleGoBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isUserBillCreator = bill.paymentUserId === user.id;
  const canClaimItems = billType === 'incoming' && !isUserBillCreator;
  const totalAmount = bill.items.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate how much the user owes
  const userClaims = bill.items
    .filter(item => selectedItems[item.itemId])
    .reduce((sum, item) => {
      const claimCount = item.claimedBy?.length || 1;
      return sum + (item.price / claimCount);
    }, 0);

  // Helper function to check if a participant has claimed any items
  const hasParticipantClaimedItems = (participantId) => {
    if (!bill || !bill.items) return false;
    
    return bill.items.some(item => 
      item.claimedBy && item.claimedBy.includes(participantId)
    );
  };
  
  // Get participants who have claimed at least one item
  const getParticipantsWithClaims = () => {
    if (!bill || !bill.participants) return [];
    
    return bill.participants.filter(id => hasParticipantClaimedItems(id));
  };
  
  // Get participants who haven't claimed any items yet
  const getParticipantsPendingClaims = () => {
    if (!bill || !bill.participants) return [];
    
    return bill.participants.filter(id => !hasParticipantClaimedItems(id));
  };
  
  // Check if all items have been claimed by at least one person
  const areAllItemsClaimed = () => {
    if (!bill || !bill.items) return false;
    
    return bill.items.every(item => 
      item.claimedBy && item.claimedBy.length > 0
    );
  };
  
  // Check if all participants have claimed at least one item
  const haveAllParticipantsClaimed = () => {
    if (!bill || !bill.participants) return false;
    
    return getParticipantsPendingClaims().length === 0;
  };

  return (
    <div className="container bill-detail-page">
      <div className="bill-detail-header">
        <button className="back-button" onClick={handleGoBack}>
          ← Back to Dashboard
        </button>
        <h1>{bill.restaurantName}</h1>
        <div className="bill-detail-meta">
          <div className="bill-date">
            {new Date(bill.createdAt).toLocaleDateString()}
          </div>
          <div className={`bill-status status-${bill.resolved ? 'resolved' : 'pending'}`}>
            {bill.resolved ? 'Resolved' : 'Pending'}
          </div>
        </div>
        <div className="bill-amount-large">
          Total: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(bill.totalAmount || totalAmount)}
        </div>
        
        {!isUserBillCreator && (
          <div className="user-amount">
            {userClaims > 0 ? `Your share: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(userClaims)}` : 'You haven\'t claimed any items'}
          </div>
        )}
      </div>
      
      {/* Participants Section */}
      <div className="bill-participants-section">
        <h2>Participants</h2>
        <div className="participants-container">
          <div className="participants-list">
            <h3>Participants with Claims</h3>
            {getParticipantsWithClaims().length === 0 ? (
              <p>No one has claimed any items yet.</p>
            ) : (
              <ul className="participants-with-claims">
                {getParticipantsWithClaims().map(participantId => (
                  <li key={participantId} className={`participant ${participantId === user.id ? 'current-user' : ''}`}>
                    <span className="participant-name">
                      {participantDetails[participantId]?.name || `User ${participantId.substring(0, 6)}...`}
                    </span>
                    {participantId === bill.paymentUserId && (
                      <span className="bill-payer-badge">Paid for Bill</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="participants-pending">
            <h3>Pending Participants</h3>
            {getParticipantsPendingClaims().length === 0 ? (
              <p>Everyone has claimed their items.</p>
            ) : (
              <ul className="participants-without-claims">
                {getParticipantsPendingClaims().map(participantId => (
                  <li key={participantId} className={`participant ${participantId === user.id ? 'current-user' : ''}`}>
                    <span className="participant-name">
                      {participantDetails[participantId]?.name || `User ${participantId.substring(0, 6)}...`}
                    </span>
                    {participantId === bill.paymentUserId && (
                      <span className="bill-payer-badge">Paid for Bill</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="bill-detail-content">
        <h2>Bill Items</h2>
        {canClaimItems && (
          <p className="claim-instructions">
            Select the items you ate to claim them. Your total will be updated automatically.
          </p>
        )}
        
        <div className="bill-items-list">
          {bill.items.map(item => (
            <div 
              key={item.itemId} 
              className={`bill-item-card ${selectedItems[item.itemId] ? 'selected' : ''} ${canClaimItems ? 'clickable' : ''}`}
              onClick={() => canClaimItems && handleItemToggle(item.itemId)}
            >
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-price">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(item.price)}
                </div>
              </div>
              
              {canClaimItems && (
                <div className="item-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox"
                    checked={selectedItems[item.itemId] || false}
                    onChange={() => handleItemToggle(item.itemId)}
                    id={`item-${item.itemId}`}
                  />
                  <label 
                    htmlFor={`item-${item.itemId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemToggle(item.itemId);
                    }}
                  >
                    I ate this
                  </label>
                </div>
              )}
              
              {item.claimedBy && item.claimedBy.length > 0 && (
                <div className="item-claimed-by">
                  <span>Claimed by: </span>
                  <ul className="claimed-by-list">
                    {item.claimedBy.map(claimantId => (
                      <li key={claimantId} className="claimant">
                        {participantDetails[claimantId]?.name || `User ${claimantId.substring(0, 6)}...`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Action buttons for claiming items (non-creators) */}
        {canClaimItems && (
          <div className="bill-actions">
            <button 
              className="form-button"
              onClick={handleSaveChanges}
              disabled={savingChanges}
            >
              {savingChanges ? 'Saving...' : 'Save My Selections'}
            </button>
            <button 
              className="form-button secondary"
              onClick={handleGoBack}
              disabled={savingChanges}
            >
              Cancel
            </button>
          </div>
        )}
        
        {/* Mark as Resolved button (only for bill creator and only if bill is not resolved) */}
        {isUserBillCreator && !bill.resolved && (
          <div className="bill-actions creator-actions">
            <button 
              className="form-button"
              onClick={handleMarkAsResolved}
              disabled={savingChanges}
            >
              {savingChanges ? 'Processing...' : 'Mark Bill as Resolved'}
            </button>
            {!areAllItemsClaimed() && (
              <p className="resolve-note">
                Note: Some items haven't been claimed yet. Marking as resolved anyway will finalize the bill.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillDetail;