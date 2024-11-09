import React from "react";
import DashboardTable from "./DashboardTable";
import productData from "../../data/ProductData"; // Adjust the import path accordingly

const AllProducts = () => {
  const inventory = productData?.PRODUCT_INVENTORY; // Get inventory data

  // Ensure inventory is defined before processing
  if (!inventory) {
    return <p>Loading inventory data...</p>;
  }

  // Get a list of all products with their date received and quantity
  const allProducts = inventory.map(item => {
    const product = productData.PRODUCT.find(p => p.PROD_ID === item.PROD_ID);
    return product
      ? {
          id: item.PROD_ID,
          name: product.PROD_NAME,
          dateReceived: item.PROD_INV_DATE_RCVD || "N/A", // Get the date received
          quantity: item.PROD_INV_QTY_ON_HAND,
        }
      : null;
  }).filter(Boolean); // Remove any nulls

  // Sort products by date received in descending order and take the top 10
  const sortedProducts = allProducts
    .sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived))
    .slice(0, 10); // Get the top 10 products

  const headers = ["Product Name", "Date Received", "Quantity"]; // Table headers
  const data = sortedProducts.map(({ name, dateReceived, quantity }) => [name, dateReceived, quantity]); // Format data for the table

  return (
    <DashboardTable
      title="Recently Added Products"
      headers={headers}
      data={data}
      onRowClick={(id) => (window.location.href = `/admin/products/${id}`)} // Navigate to product details page
    />
  );
};

export default AllProducts;
