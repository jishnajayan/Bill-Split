import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AddFriendForm from '../components/AddFriendForm';
import FriendsList from '../components/FriendsList';

const AddFriendPage = () => {
  const { user } = useContext(AuthContext);
  
  // This state will be used to force a refresh of the friends list
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Callback when a friend is added
  const handleFriendAdded = () => {
    // Increment the key to force a re-render of FriendsList component
    setRefreshKey(key => key + 1);
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1>Manage Friends</h1>
      <p>Add friends to split bills with them or view your existing friends.</p>
      
      <div className="row" style={{ marginTop: '30px' }}>
        <div className="col">
          <AddFriendForm 
            userId={user.id} 
            onFriendAdded={handleFriendAdded} 
          />
        </div>
      </div>
      
      <div className="row" style={{ marginTop: '30px' }}>
        <div className="col">
          <FriendsList 
            userId={user.id} 
            key={refreshKey} // Force re-render when refreshKey changes
            friendBalances={{}} // Empty balances since we're just showing the list
          />
        </div>
      </div>
    </div>
  );
};

export default AddFriendPage;