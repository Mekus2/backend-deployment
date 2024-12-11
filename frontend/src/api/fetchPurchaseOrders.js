//api/fetchPurchaseOrders.js

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const fetchPurchaseOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/supplier-order/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

export const fetchPurchaseDetailsById = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/supplier-order/${orderId}/details`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

export const addNewPurchaseOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/supplier-order/`,
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("New purchase order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};
