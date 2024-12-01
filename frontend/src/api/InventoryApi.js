import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

// Function to add a new inventory entry
export const addNewInventory = async (orderData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/inventory/accept`,
      orderData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.info("New product delivery added to Inventory", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order details.");
    return null;
  }
};

// Function to fetch the inventory list
export const getInventoryList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/inventory/list/`);
    console.info("Fetched inventory list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch inventory list.");
    return null;
  }
};
