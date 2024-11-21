import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const addNewInventoy = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/inventory/`, orderData, {
      headers: { "Content-Type": "application/json" },
    });
    console.info("New product delivery added to Inventory", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order details.");
    return null;
  }
};
