import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed in your project
import DashboardTable from "./DashboardTable"; // Adjust the path accordingly

const ExpiredItemsAlert = () => {
  const [expiringProducts, setExpiringProducts] = useState([]); // State to store the expiring products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch data from the backend API
  useEffect(() => {
    const fetchExpiringProducts = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/inventory/expiredsoon/"
        );
        setExpiringProducts(response.data); // Store fetched data
      } catch (err) {
        setError("Error fetching expiring products.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringProducts(); // Call the fetch function
  }, []);

  // Show loading or error message
  if (loading) {
    return <p>Loading expiring products...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const headers = ["Product Name", "Quantity", "Expiry Date"]; // Table headers
  const data = expiringProducts.map(
    ({ PRODUCT_NAME, QUANTITY_ON_HAND, EXPIRY_DATE }) => [
      PRODUCT_NAME,
      QUANTITY_ON_HAND,
      new Date(EXPIRY_DATE).toLocaleDateString(), // Format expiry date
    ]
  ); // Format data for the table

  return (
    <DashboardTable
      title="Expiring Soon"
      headers={headers}
      data={data}
      onRowClick={(id) => (window.location.href = `/staff/inventory/${id}`)} // Navigate to specific product's inventory page
    />
  );
};

export default ExpiredItemsAlert;
