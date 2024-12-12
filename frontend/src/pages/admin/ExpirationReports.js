import React, { useState } from "react";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Card from "../../components/Layout/Card";
import Button from "../../components/Layout/Button"; // Import Button component
import { colors } from "../../colors";
import { FaExclamationTriangle } from "react-icons/fa"; // Import an icon for the card

const ExpirationReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expirationData, setExpirationData] = useState([
    {
      item_name: "Canine Multivitamin",
      expiration_date: "2024-12-15",
      days_to_expire: 3,
    },
    {
      item_name: "Feline Omega Oil",
      expiration_date: "2024-12-20",
      days_to_expire: 8,
    },
    {
      item_name: "Equine Joint Supplement",
      expiration_date: "2024-12-25",
      days_to_expire: 13,
    },
    {
      item_name: "Avian Calcium Boost",
      expiration_date: "2024-12-18",
      days_to_expire: 6,
    },
    {
      item_name: "Reptile Multivitamin",
      expiration_date: "2024-12-30",
      days_to_expire: 18,
    },
  ]);

  const [filteredExpirationData, setFilteredExpirationData] = useState(expirationData);

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = expirationData.filter((item) => {
      if (!value) return true;
      return Object.values(item).some(
        (field) => field && field.toString().toLowerCase().includes(value)
      );
    });
    setFilteredExpirationData(filtered);
  };

  const headers = [
    "Item Name",
    "Expiration Date",
    "Days to Expire",
    "Action",
  ];

  const rows = filteredExpirationData.map((item) => [
    item.item_name,
    item.expiration_date,
    item.days_to_expire,
    <Button onClick={() => alert(`Details for ${item.item_name}`)}>
      Details
    </Button>,
  ]);

  return (
    <MainLayout>
      <HeaderCard>
        <Card
          label="Expiring Soon"
          value={filteredExpirationData.length}
          bgColor={colors.warning}
          icon={<FaExclamationTriangle />} // Add the icon here
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

export default ExpirationReports;
