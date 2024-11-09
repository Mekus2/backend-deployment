import React from "react";
import Table from "../../Layout/Table"; // Import the Table component

const PriceHistoryDetails = ({ priceHistory, userMapping }) => {
  // Check if there is any price history available
  if (!priceHistory || priceHistory.length === 0) {
    return <p>No price history available.</p>;
  }

  // Format currency to PHP format
  const formatCurrency = (value) => 
    `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  // Prepare the table data, replacing user IDs with usernames
  const tableData = priceHistory.map((entry) => [
    formatCurrency(entry.OLD_PRICE), // Format old price
    formatCurrency(entry.NEW_PRICE), // Format new price
    new Date(entry.CHANGE_DATE).toLocaleDateString(), // Format change date
    userMapping[entry.UPDATED_BY_USER_ID] || "Unknown User" // Map user ID to username
  ]);

  // Render the table with headers and rows
  return (
    <Table
      headers={["Old Price", "New Price", "Change Date", "Updated By"]}
      rows={tableData}
    />
  );
};

export default PriceHistoryDetails;
