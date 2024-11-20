import React from "react";
import DashboardTable from "./DashboardTable";

const sampleData = [
  { id: 1, name: "Premium Dog Food", quantity: 450, revenue: "₱ 45,000" },
  { id: 2, name: "Cat Litter", quantity: 320, revenue: "₱ 32,000" },
  { id: 3, name: "Bird Seed", quantity: 250, revenue: "₱ 25,000" },
  { id: 4, name: "Hamster Wheel", quantity: 150, revenue: "₱ 15,000" },
  { id: 5, name: "Aquarium Heater", quantity: 90, revenue: "₱ 9,000" },
];

const HighestSellingProducts = () => {
  const headers = ["Product Name", "Quantity Sold", "Revenue"];
  const data = sampleData.map(product => [product.name, product.quantity, product.revenue]);

  return (
    <DashboardTable
      title="Highest Selling Products"
      headers={headers}
      data={data}
      onRowClick={(id) => window.location.href = "/admin/products"}
    />
  );
};

export default HighestSellingProducts;
