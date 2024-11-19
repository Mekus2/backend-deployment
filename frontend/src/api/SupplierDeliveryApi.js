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
