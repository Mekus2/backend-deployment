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

export const fetchCountOrders = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/delivery/supplier/total-orders`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { pending_total: 0 };
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

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/delivery/supplier/${orderId}/update`,
      {
        INBOUND_DEL_STATUS: newStatus, // Ensure this matches your backend expectation
      }
    );

    console.info("Updated Successfully", response.status);
    return response.status; // Return the status for further use if needed
  } catch (error) {
    console.error("Failed to update status:", error.message || error);
    throw new Error("Failed to update order status"); // Throw error for handling
  }
};
