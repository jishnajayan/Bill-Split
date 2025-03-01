import axios from 'axios';

export const getUserFriends = async (userId) => {
  try {
    const response = await axios.get(`/api/v1/users/${userId}/friends`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await axios.get(`/api/v1/users/${userId}`);
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

export const addFriend = async (userId, friendEmail) => {
  try {
    const response = await axios.post(`/api/v1/users/${userId}/friends`, { friendEmail });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFriend = async (userId, friendUserId) => {
  try {
    await axios.delete(`/api/v1/users/${userId}/friends/${friendUserId}`);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getIncomingBills = async (userId, resolved = false) => {
  try {
    const response = await axios.get(`/api/v1/users/${userId}/bills/incoming?resolved=${resolved}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOutgoingBills = async (userId, resolved = false) => {
  try {
    const response = await axios.get(`/api/v1/users/${userId}/bills/outgoing?resolved=${resolved}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};