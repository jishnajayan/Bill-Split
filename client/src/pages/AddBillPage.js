import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AddBillForm from '../components/AddBillForm';
import { useNavigate } from 'react-router-dom';

const AddBillPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleBillAdded = () => {
    // After a bill is successfully added, wait a moment then redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1>Create New Bill</h1>
      <p>Split a bill with your friends by specifying the restaurant, items, and who's paying for what.</p>
      
      <div className="row" style={{ marginTop: '30px' }}>
        <div className="col">
          <AddBillForm userId={user.id} onBillAdded={handleBillAdded} />
        </div>
      </div>
    </div>
  );
};

export default AddBillPage;