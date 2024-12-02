import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";
// const TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4OTc5NDM5LCJpYXQiOjE3Mjg5NzkxMzksImp0aSI6ImY1OTdjYWZjOWFiZjQ3MDE4MDdlNGIzN2Y3NTBlYWRmIiwidXNlcl9pZCI6Mn0.FXTX1OFzbJ3fWL0bTxef1-QNda-oWAlCcXoOwzLCKVs";

export const fetchCustomerOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/customer-order/`, {
      // headers: {
      //   Authorization: `Bearer ${TOKEN}`,
      // },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

// Function to get total pending customer orders
export const fetchCountOrders = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/customer-order/total-orders`
    );
    return response.data; // { pending_total: <number> }
  } catch (error) {
    console.error("Failed to fetch count data:", error);
    return { pending_total: 0 }; // Return a fallback value
  }
};

// Function to fetch order details by ID
export const fetchOrderDetailsById = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/customer-order/${orderId}/details`,
      {
        // headers: {
        //   Authorization: `Bearer ${TOKEN}`,
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order details.");
    return null;
  }
};

export const addNewCustomerOrder = async (orderData) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/customer-order/",
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("New customer order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding customer order:", error);
    throw error;
  }
};

export const acceptCustomerOrder = async (sales_order_id, username) => {
  const apiUrl = `${BASE_URL}/api/sales-order/${sales_order_id}/accept/`; // Adjust the URL to your actual endpoint

  const requestBody = {
    SALES_ORDER_STATUS: "Accepted",
    USERNAME: username,
  };

  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        // Include authorization if needed, e.g., Bearer token
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
    });

    console.log("Success:", response.data);
    return response.data; // Handle the success response here
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    // Handle error, show user-friendly message
    throw error;
  }
};
