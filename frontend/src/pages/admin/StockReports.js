import React, { useState } from "react";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Card from "../../components/Layout/Card";
import Button from "../../components/Layout/Button"; // Import Button component
import { colors } from "../../colors";
import { FaBoxOpen } from "react-icons/fa"; // Import an icon for the card

const LowStockReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockData, setLowStockData] = useState([
    {
      item_name: "Canine Multivitamin",
      current_stock: 5,
      threshold: 10,
    },
    {
      item_name: "Feline Omega Oil",
      current_stock: 8,
      threshold: 15,
    },
    {
      item_name: "Equine Joint Supplement",
      current_stock: 2,
      threshold: 5,
    },
    {
      item_name: "Avian Calcium Boost",
      current_stock: 4,
      threshold: 7,
    },
    {
      item_name: "Reptile Multivitamin",
      current_stock: 1,
      threshold: 5,
    },
  ]);

  const [filteredLowStockData, setFilteredLowStockData] = useState(lowStockData);

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = lowStockData.filter((item) => {
      if (!value) return true;
      return Object.values(item).some(
        (field) => field && field.toString().toLowerCase().includes(value)
      );
    });
    setFilteredLowStockData(filtered);
  };

  const headers = [
    "Item Name",
    "Current Stock",
    "Threshold",
    "Action",
  ];

  const rows = filteredLowStockData.map((item) => [
    item.item_name,
    item.current_stock,
    item.threshold,
    <Button onClick={() => alert(`Details for ${item.item_name}`)}>
      Details
    </Button>,
  ]);

  return (
    <MainLayout>
      <HeaderCard>
        <Card
          label="Low Stock Items"
          value={filteredLowStockData.length}
          bgColor={colors.danger}
          icon={<FaBoxOpen />} // Add the icon here
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

export default LowStockReport;
