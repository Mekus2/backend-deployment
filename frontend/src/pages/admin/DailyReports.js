import React, { useState } from "react";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Card from "../../components/Layout/Card";
import Button from "../../components/Layout/Button"; // Import Button component
import { colors } from "../../colors";
import { FaClipboardList } from "react-icons/fa"; // Import an icon for the card

const StocksReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockData, setStockData] = useState([
    {
      product_name: "Canine Multivitamin",
      opening_qty: 50,
      sold_qty: 20,
      delivered_qty: 10,
      total_qty: 40,
    },
    {
      product_name: "Feline Omega Oil",
      opening_qty: 30,
      sold_qty: 15,
      delivered_qty: 5,
      total_qty: 20,
    },
    {
      product_name: "Equine Joint Supplement",
      opening_qty: 20,
      sold_qty: 5,
      delivered_qty: 10,
      total_qty: 25,
    },
  ]);

  const [filteredStockData, setFilteredStockData] = useState(stockData);

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = stockData.filter((item) => {
      if (!value) return true;
      return Object.values(item).some(
        (field) => field && field.toString().toLowerCase().includes(value)
      );
    });
    setFilteredStockData(filtered);
  };

  const headers = [
    "Product Name",
    "Opening Qty",
    "Sold Qty",
    "Delivered Qty",
    "Total Qty",
    "Action",
  ];

  const rows = filteredStockData.map((item) => [
    item.product_name,
    item.opening_qty,
    item.sold_qty,
    item.delivered_qty,
    item.total_qty,
    <Button onClick={() => alert(`Details for ${item.product_name}`)}>
      Details
    </Button>,
  ]);

  return (
    <MainLayout>
      <HeaderCard>
        <Card
          label="Total Products"
          value={filteredStockData.length}
          bgColor={colors.primary}
          icon={<FaClipboardList />} // Add the icon here
        />
      </HeaderCard>
      <Controls>
        <SearchBar
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Controls>
      <Table headers={headers} rows={rows} />
    </MainLayout>
  );
};

// Styled components
const HeaderCard = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export default StocksReport;
