import React, { useState } from "react";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Card from "../../components/Layout/Card"; // Import Card component
import { colors } from "../../colors";
import { FaClipboardList } from "react-icons/fa"; // Import an icon

const DailyReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockData, setStockData] = useState([
    {
      item_name: "Item A",
      opening_stock: 100,
      stock_in: 50,
      stock_out: 30,
      closing_stock: 120,
    },
    {
      item_name: "Item B",
      opening_stock: 200,
      stock_in: 70,
      stock_out: 20,
      closing_stock: 250,
    },
    {
      item_name: "Item C",
      opening_stock: 150,
      stock_in: 40,
      stock_out: 60,
      closing_stock: 130,
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
    "Item Name",
    "Opening Stock",
    "Stock In",
    "Stock Out",
    "Closing Stock",
  ];

  const rows = filteredStockData.map((item) => [
    item.item_name,
    item.opening_stock,
    item.stock_in,
    item.stock_out,
    item.closing_stock,
  ]);

  return (
    <MainLayout>
      <HeaderCard>
        <Card
          label="Total Reports"
          value={filteredStockData.length}
          bgColor={colors.primary}
          icon={<FaClipboardList />} // Add the icon here
        />
      </HeaderCard>
      <Controls>
        <SearchBar
          placeholder="Search items..."
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

export default DailyReportsPage;
