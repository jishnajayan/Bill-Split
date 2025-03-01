import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddFriendPage from './pages/AddFriendPage';
import AddBillPage from './pages/AddBillPage';
import BillDetail from './pages/BillDetail';
import ProtectedRoute from './utils/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-friend" element={<AddFriendPage />} />
          <Route path="/add-bill" element={<AddBillPage />} />
          <Route path="/bill/:billId" element={<BillDetail />} />
        </Route>
        
        {/* Catch all route - redirect to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;