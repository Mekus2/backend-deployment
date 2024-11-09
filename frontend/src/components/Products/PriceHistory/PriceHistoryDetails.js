import React from "react";
import Table from "../../Layout/Table";

const PriceHistoryDetails = ({ priceHistory }) => {
  if (!priceHistory || priceHistory.length === 0) {
    return <p>No price history available.</p>;
  }

  const formatCurrency = (value) => 
    `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const tableData = priceHistory.map((entry) => [
    formatCurrency(entry.OLD_PRICE),
    formatCurrency(entry.NEW_PRICE),
    new Date(entry.CHANGE_DATE).toLocaleDateString(),
  ]);

  return (
    <Table
      headers={["Old Price", "New Price", "Change Date"]}
      rows={tableData}
    />
  );
};

export default PriceHistoryDetails;
