import axios from 'axios';

export const createBill = async (billData) => {
  try {
    const response = await axios.post('/api/v1/bills', billData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBillById = async (billId) => {
  try {
    const response = await axios.get(`/api/v1/bills/${billId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBill = async (billId, updatedData) => {
  try {
    const response = await axios.patch(`/api/v1/bills/${billId}`, updatedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};