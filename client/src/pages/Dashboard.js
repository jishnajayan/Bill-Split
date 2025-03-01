import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FriendsList from '../components/FriendsList';
import BillTabs from '../components/BillTabs';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [friendBalances, setFriendBalances] = useState({});

  // Use useCallback to prevent the function from being recreated on every render
  // This prevents infinite loop in child components that depend on this function
  const handleBillsLoaded = useCallback((balances) => {
    setFriendBalances(balances);
  }, []);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user.name}!</h1>
          <p className="dashboard-subtitle">
            Manage your bills and track what you owe and what others owe you.
          </p>
          
          <div className="dashboard-actions">
            <Link to="/add-friend" className="form-button secondary">
              Add Friend
            </Link>
            <Link to="/add-bill" className="form-button">
              Create New Bill
            </Link>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="row">
            <div className="col">
              <FriendsList 
                userId={user.id} 
                friendBalances={friendBalances} 
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <BillTabs 
                userId={user.id} 
                onBillsLoaded={handleBillsLoaded} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;