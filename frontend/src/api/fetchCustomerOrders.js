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
