import React from "react";
import DashboardTable from "./DashboardTable";
import productData from "../../data/ProductData"; // Adjust the import path accordingly

const ExpiredItemsAlert = () => {
  const inventory = productData?.PRODUCT_INVENTORY; // Get inventory data

  // Ensure inventory is defined before using filter
  if (!inventory) {
    return <p>Loading inventory data...</p>;
  }

  // Get the current date
  const currentDate = new Date();

  // Get a list of all products with their quantities and expiry dates
  const allProducts = inventory
    .map((item) => {
      const product = productData.PRODUCT.find((p) => p.PROD_ID === item.PROD_ID);
      return product
        ? {
            id: item.PROD_ID,
            name: product.PROD_NAME,
            quantity: item.PROD_INV_QTY_ON_HAND,
            expiryDate: item.PROD_INV_EXP_DATE,
            daysToExpiry: (new Date(item.PROD_INV_EXP_DATE) - currentDate) / (1000 * 60 * 60 * 24), // Calculate days to expiry
          }
        : null;
    })
    .filter(Boolean) // Remove any nulls
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry) // Sort by days to expiry
    .slice(0, 5); // Get the top 5 nearest to expiry

  // Define table headers
  const headers = ["Product Name", "Quantity", "Expiry Date"];
  // Format data for the table
  const data = allProducts.map(({ name, quantity, expiryDate }) => [name, quantity, expiryDate]);

  return (
    <DashboardTable
      title="Expiring Soon"
      headers={headers}
      data={data}
      onRowClick={(id) => (window.location.href = `/admin/inventory/${id}`)} // Navigate to specific product's inventory page
    />
  );
};

export default ExpiredItemsAlert;
