import React from "react";
import DashboardTable from "./DashboardTable";
import productData from "../../data/ProductData"; // Adjust the import path accordingly

const LowestStocks = () => {
  const lowStockThreshold = 10; // Define the threshold for low stock
  const inventory = productData?.PRODUCT_INVENTORY; // Get inventory data

  // Ensure inventory is defined before using filter
  if (!inventory) {
    return <p>Loading inventory data...</p>;
  }

  // Get a list of low-stock products and their quantities
  const lowStockProducts = inventory
    .filter((item) => item.PROD_INV_QTY_ON_HAND <= lowStockThreshold) // Filter low stock items
    .map((item) => {
      const product = productData.PRODUCT.find((p) => p.PROD_ID === item.PROD_ID);
      return product
        ? { id: item.PROD_ID, name: product.PROD_NAME, quantity: item.PROD_INV_QTY_ON_HAND }
        : null;
    })
    .filter(Boolean) // Remove any nulls
    .sort((a, b) => a.quantity - b.quantity); // Sort by quantity ascending

  const headers = ["Product Name", "Number of Stocks"]; // Table headers
  const data = lowStockProducts.map(({ name, quantity }) => [name, quantity]); // Format data for the table

  return (
    <DashboardTable
      title="Lowest Stocks"
      headers={headers}
      data={data}
      onRowClick={(id) => (window.location.href = `/admin/inventory/${id}`)} // Navigate to specific product's inventory page
    />
  );
};

export default LowestStocks;
