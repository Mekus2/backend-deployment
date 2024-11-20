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
    console.error("Failed to fetch order details.");
    return null;
  }
};
