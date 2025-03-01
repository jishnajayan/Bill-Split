import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncomingBills, getOutgoingBills } from '../services/userService';

const BillTabs = ({ userId, onBillsLoaded }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incoming');
  const [showResolved, setShowResolved] = useState(false); // Default to showing pending bills
  const [incomingBills, setIncomingBills] = useState([]);
  const [outgoingBills, setOutgoingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create fetchBills as a useCallback so it can be called when filter changes
  const fetchBills = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching bills for user:", userId, "showResolved:", showResolved);
      
      // Always fetch both pending and resolved bills for accurate balance calculation
      // But we'll only display the ones matching the filter
      const [pendingIncoming, pendingOutgoing, resolvedIncoming, resolvedOutgoing] = await Promise.all([
        getIncomingBills(userId, false),  // Pending incoming
        getOutgoingBills(userId, false),  // Pending outgoing
        getIncomingBills(userId, true),   // Resolved incoming
        getOutgoingBills(userId, true)    // Resolved outgoing
      ]);
      
      // For display, use only the bills matching the current filter
      const incomingResponse = showResolved ? resolvedIncoming : pendingIncoming;
      const outgoingResponse = showResolved ? resolvedOutgoing : pendingOutgoing;
      
      // For balance calculation, use ALL bills (both pending and resolved)
      const allIncomingBills = [...pendingIncoming, ...resolvedIncoming];
      const allOutgoingBills = [...pendingOutgoing, ...resolvedOutgoing];
      
      console.log("Showing in UI - Incoming bills:", incomingResponse.length);
      console.log("Showing in UI - Outgoing bills:", outgoingResponse.length);
      console.log("For balance calc - All incoming bills:", allIncomingBills.length);
      console.log("For balance calc - All outgoing bills:", allOutgoingBills.length);
      
      // Only update state if the component is still mounted
      if (isMounted) {
        setIncomingBills(incomingResponse);
        setOutgoingBills(outgoingResponse);
        
        return { 
          // For display in UI
          incomingBills: incomingResponse, 
          outgoingBills: outgoingResponse,
          // For balance calculation
          allIncomingBills,
          allOutgoingBills
        };
      }
      
      return null;
    } catch (err) {
      if (isMounted) {
        setError('Failed to load bills');
        console.error('Error loading bills:', err);
      }
      return null;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [userId, showResolved]);
  
  // Effect to fetch bills and calculate balances
  useEffect(() => {
    let isMounted = true;
    
    const loadBillsAndCalculateBalances = async () => {
      try {
        const result = await fetchBills();
        
        // Skip balance calculation if component unmounted or no result
        if (!isMounted || !result) return;
        
        const { 
          // For display in UI
          incomingBills: incomingResponse, 
          outgoingBills: outgoingResponse,
          // For balance calculation - use ALL bills including resolved ones
          allIncomingBills,
          allOutgoingBills 
        } = result;
        
        // Calculate friend balances based on bills
        const balances = {};

        console.log("========== CALCULATING BALANCES ==========");
        
        // For bills you've created (outgoing from your perspective - others need to pay you)
        console.log("OUTGOING BILLS (You paid, others owe you):");
        allOutgoingBills.forEach((bill, billIndex) => {
          // Include all bills, even resolved ones, in balance calculation
          // This ensures settled bills are still reflected in the balance
          console.log(`Bill ${billIndex+1}: ${bill.restaurantName}, resolved: ${bill.resolved}`);
          
          bill.items.forEach((item, itemIndex) => {
            console.log(`  Item ${itemIndex+1}: ${item.name}, price: $${item.price}`);
            
            // Check if item has been claimed by anyone other than you
            const otherClaimants = item.claimedBy ? 
              item.claimedBy.filter(id => id !== userId) : [];
            
            if (otherClaimants.length > 0) {
              // Split the item cost equally among all claimants (including you if you claimed it)
              const totalClaimants = item.claimedBy.length;
              const splitCost = item.price / totalClaimants;
              
              otherClaimants.forEach(claimUserId => {
                // Add to the balance (positive means they owe you)
                balances[claimUserId] = (balances[claimUserId] || 0) + splitCost;
                console.log(`    User ${claimUserId} claimed this item, owes you: +$${splitCost.toFixed(2)}`);
              });
            } else if (!item.claimedBy || item.claimedBy.length === 0) {
              console.log(`    No one claimed this item yet`);
            } else {
              console.log(`    Only you claimed this item`);
            }
          });
        });
        
        // For bills where you are a participant (incoming from your perspective - you need to pay others)
        console.log("INCOMING BILLS (Others paid, you owe them):");
        allIncomingBills.forEach((bill, billIndex) => {
          // Include all bills, even resolved ones, in balance calculation
          console.log(`Bill ${billIndex+1}: ${bill.restaurantName}, resolved: ${bill.resolved}`);
          
          bill.items.forEach((item, itemIndex) => {
            console.log(`  Item ${itemIndex+1}: ${item.name}, price: $${item.price}`);
            
            // Check if you've claimed this item
            if (item.claimedBy && item.claimedBy.includes(userId)) {
              // Calculate your portion
              const splitCost = item.price / item.claimedBy.length;
              
              // Add to the balance (negative means you owe them)
              balances[bill.paymentUserId] = (balances[bill.paymentUserId] || 0) - splitCost;
              console.log(`    You claimed this item, you owe: -$${splitCost.toFixed(2)} to ${bill.paymentUserId}`);
            } else {
              console.log(`    You did not claim this item`);
            }
          });
        });
        
        console.log("Detailed balance calculation:");
        console.log("- Positive numbers mean they owe you money");
        console.log("- Negative numbers mean you owe them money");
        console.log("Final balances:", balances);
        
        // Pass the calculated balances to the parent component (only if mounted)
        if (isMounted && onBillsLoaded) {
          onBillsLoaded(balances);
        }
      } catch (error) {
        console.error("Error calculating balances:", error);
        if (isMounted) {
          setError("Error loading or calculating bill data");
        }
      }
    };

    if (userId) {
      loadBillsAndCalculateBalances();
    }
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [userId, fetchBills]); // Re-run when userId or fetchBills changes (which depends on showResolved)

  const handleBillClick = (billId, isIncoming) => {
    navigate(`/bill/${billId}?type=${isIncoming ? 'incoming' : 'outgoing'}`);
  };

  const renderBillsList = (bills, isIncoming = false) => {
    if (bills.length === 0) {
      return (
        <div className="card empty-state">
          <div className="card-body">
            <p className="empty-message">
              {isIncoming 
                ? "You don't have any bills to claim yet." 
                : "You haven't created any bills yet."}
            </p>
            {!isIncoming && (
              <div className="empty-state-actions">
                <button 
                  className="form-button create-bill-btn"
                  onClick={() => navigate('/add-bill')}
                >
                  Create Your First Bill
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return bills.map((bill) => (
      <div 
        key={bill._id} 
        className="bill-card"
        onClick={() => handleBillClick(bill._id, isIncoming)}
      >
        <div className="bill-header">
          <div className="bill-restaurant">{bill.restaurantName}</div>
          <div className="bill-date">
            {new Date(bill.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="bill-amount">
          Total: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(bill.totalAmount)}
        </div>
        
        <div className="bill-status">
          Status: <span className={bill.resolved ? 'status-resolved' : 'status-pending'}>
            {bill.resolved ? 'Resolved' : 'Pending'}
          </span>
        </div>
        
        <div className="bill-participants">
          {bill.participants.length} participants
        </div>
        
        <div className="bill-card-footer">
          <div className="bill-action-hint">
            Click to {isIncoming ? 'claim your items' : 'manage this bill'} →
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return <div className="loading-container">Loading bills...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const handleToggleResolved = () => {
    setShowResolved(prev => !prev);
  };

  return (
    <div className="tabs">
      <div className="tab-list">
        <div
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Bills to Claim
        </div>
        <div
          className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          My Bills
        </div>
      </div>
      
      <div className="filter-controls">
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="resolved-toggle"
            checked={showResolved}
            onChange={handleToggleResolved}
          />
          <label htmlFor="resolved-toggle">
            <span className="toggle-label">Show {showResolved ? 'Pending' : 'Resolved'}</span>
            <span className="toggle-track"></span>
          </label>
        </div>
        <div className="status-indicator">
          Currently showing: <span className={`status-badge ${showResolved ? 'status-resolved' : 'status-pending'}`}>
            {showResolved ? 'Resolved Bills' : 'Pending Bills'}
          </span>
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'incoming' ? (
          <div>
            <h3>Bills From Friends {showResolved ? '(Resolved)' : ''}</h3>
            <p>
              {showResolved 
                ? 'These are bills where you\'ve already selected your items.'
                : 'These are bills added by others where you need to select what you ate.'}
            </p>
            {incomingBills.length === 0 && (
              <div className="empty-state-message">
                {showResolved 
                  ? "You don't have any resolved bills from friends."
                  : "You don't have any pending bills to claim."}
              </div>
            )}
            {renderBillsList(incomingBills, true)}
          </div>
        ) : (
          <div>
            <h3>Bills You Added {showResolved ? '(Resolved)' : ''}</h3>
            <p>
              {showResolved 
                ? 'These are your bills that have been resolved.'
                : 'These are bills you created and paid for. Others will claim their items from these bills.'}
            </p>
            {outgoingBills.length === 0 && (
              <div className="empty-state-message">
                {showResolved 
                  ? "You don't have any resolved bills you've created."
                  : "You don't have any pending bills you've created."}
              </div>
            )}
            {renderBillsList(outgoingBills, false)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillTabs;