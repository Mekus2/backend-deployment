import React, { useState, useEffect } from "react";
import DashboardTable from "./DashboardTable";
import axios from "axios"; // Import axios for HTTP requests

const LowestStocks = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]); // State to store the low-stock products
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch data from the backend API
  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/items/lowStock/"
        ); // API URL for low stock products
        setLowStockProducts(response.data); // Set the fetched data to state
      } catch (err) {
        setError("Error fetching low stock products."); // Handle errors
      } finally {
        setLoading(false); // Set loading to false after data fetch is complete
      }
    };

    fetchLowStockProducts(); // Call the fetch function
  }, []);

  // Show loading or error message if applicable
  if (loading) {
    return <p>Loading inventory data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const headers = ["Product Name", "Quantity on Hand"]; // Table headers
  const data = lowStockProducts.map(({ PROD_NAME, PROD_QOH }) => [
    PROD_NAME,
    PROD_QOH,
  ]); // Format data for the table

  return (
    <DashboardTable
      title="Lowest Stocks"
      headers={headers}
      data={data}
      onRowClick={(id) => (window.location.href = `/staff/inventory/${id}`)} // Navigate to specific product's inventory page
    />
  );
};

export default LowestStocks;
