import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const addNewSupplierDelivery = async (orderData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/delivery/supplier`,
      orderData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("New supplier delivery created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order details.");
    return null;
  }
};

export const fetchSupplierDelivery = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/delivery/supplier`);
    console.log("Fetched Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/delivery/supplier/${orderId}/details`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch details.");
    return [];
  }
};
