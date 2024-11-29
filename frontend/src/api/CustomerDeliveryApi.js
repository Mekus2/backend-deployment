import axios from "axios";

// Base URL for the supplier API
const BASE_URL = "http://127.0.0.1:8000/";

// Function to add new Customer Order Delivery
export const addNewCustomerDelivery = async (orderData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/delivery/customer`,
      orderData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Successfully added new customer delivery");
    return response.data;
  } catch (error) {
    console.error("Error adding new customer delivery:", error);
    return null; // Return null to indicate failure
  }
};

// Function to fetch the count of orders
export const fetchCountOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/delivery/customer/total-orders`);
    return response.data || { pending_total: 0 }; // Default to 0 if data is not found
  } catch (error) {
    console.error("Failed to fetch order count:", error);
    return { pending_total: 0 }; // Return default data in case of failure
  }
};

// Function to fetch all customer deliveries
export const fetchCustomerDelivery = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/delivery/customer`);
    console.info("Fetched customer deliveries:", response.data);
    return response.data || []; // Ensure a default empty array in case of empty response
  } catch (err) {
    console.error("Failed to fetch customer deliveries:", err);
    return []; // Return empty array on failure
  }
};

export const updateDeliveryStatus = async (orderId, statusData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/delivery/customer/${orderId}/accept`, // Change here
      statusData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Successfully updated delivery status");
    return response.data;
  } catch (error) {
    console.error("Failed to update delivery status", error);
    return null;
  }
};

// Function to fetch customer delivery details
export const fetchCustomerDelDetails = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/delivery/customer/${orderId}/details`
    );
    return response.data || {}; // Ensure default empty object in case of no data
  } catch (error) {
    console.error(`Failed to fetch details for order ID ${orderId}:`, error);
    return {}; // Return empty object in case of failure
  }
};
