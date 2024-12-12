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
    const response = await axios.get(
      `${BASE_URL}/api/delivery/customer/total-orders`
    );
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

// Update Delivery Status
export const updateDeliveryStatus = async (orderId, statusData) => {
  try {
    // Add the received date when updating the status to 'Delivered'
    if (statusData.status === "Delivered") {
      statusData.receivedDate = new Date().toISOString(); // Add current date and time as ISO string
    }

    const response = await axios.patch(
      `${BASE_URL}/api/delivery/customer/${orderId}/accept`, // Ensure correct endpoint
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

// Function to create a new sales invoice
export const createSalesInvoice = async (outboundDeliveryId, orderDetails) => {
  const url = `${BASE_URL}/api/delivery/customer/${outboundDeliveryId}/create-invoice/`; // Your API endpoint URL with pk

  try {
    // Prepare the request body
    const requestBody = {
      items: orderDetails.map((item) => ({
        prod_details_id: item.OUTBOUND_DEL_DETAIL_ID,
        productId: item.OUTBOUND_DETAILS_PROD_ID, // Replace with the correct key for product ID
        qtyAccepted: item.QTY_ACCEPTED || 0,
        qtyDefect: item.QTY_DEFECT || 0,
      })),
    };

    // Send POST request to backend using axios
    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response status
    return response.status;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("Error:", error.response.data.error);
      alert("Error creating Sales Invoice: " + error.response.data.error);
      return error.response.status; // Return the error status
    } else if (error.request) {
      // Request was made but no response was received
      console.error("Network Error:", error.request);
      alert("Network Error: Unable to create Sales Invoice.");
      return 500; // Return a 500 status for network errors
    } else {
      // Something else went wrong
      console.error("Error:", error.message);
      alert("Unexpected error: " + error.message);
      return 500; // Return a 500 status for unexpected errors
    }
  }
};
