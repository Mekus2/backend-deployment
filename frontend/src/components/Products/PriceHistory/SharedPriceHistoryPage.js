import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import ReportCard from "../../Layout/ReportCard";
import Button from "../../Layout/Button"; // Import Button component
import { FaHistory, FaDollarSign } from "react-icons/fa";
import productData from "../../../data/ProductData";
import PRICE_HISTORY_DATA from "../../../data/PriceHistoryData";
import { USER } from '../../../data/UserData';
import Modal from "../../Layout/Modal"; 
import PriceHistoryDetails from "./PriceHistoryDetails"; // Import the new component

const SharedPriceHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProductHistory, setSelectedProductHistory] = useState(null);

  const productMapping = Object.fromEntries(
    productData.PRODUCT.map((product) => [product.PROD_ID, product.PROD_NAME])
  );

  const userMapping = Object.fromEntries(
    USER.map((user) => [user.USER_ID, `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`])
  );

  const filteredPriceHistory = PRICE_HISTORY_DATA.filter((entry) => {
    const productName = productMapping[entry.PROD_ID] || "Unknown Product";
    const userName = userMapping[entry.UPDATED_BY_USER_ID] || "Unknown User";
    const oldPrice = entry.OLD_PRICE.toFixed(2);
    const newPrice = entry.NEW_PRICE.toFixed(2);
    const changeDate = new Date(entry.CHANGE_DATE).toLocaleDateString();

    const matchesSearchTerm =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oldPrice.includes(searchTerm) ||
      newPrice.includes(searchTerm) ||
      changeDate.includes(searchTerm);

    const matchesDateRange =
      (!startDate || new Date(entry.CHANGE_DATE) >= new Date(startDate)) &&
      (!endDate || new Date(entry.CHANGE_DATE) <= new Date(endDate));

    return matchesSearchTerm && matchesDateRange;
  });

  const sortedPriceHistory = filteredPriceHistory.sort(
    (a, b) => new Date(b.CHANGE_DATE) - new Date(a.CHANGE_DATE)
  );

  const totalChanges = sortedPriceHistory.length;
  const maxIncrease = Math.max(
    ...sortedPriceHistory.map((entry) => entry.NEW_PRICE - entry.OLD_PRICE),
    0
  ).toFixed(2);
  const maxDecrease = Math.min(
    ...sortedPriceHistory.map((entry) => entry.NEW_PRICE - entry.OLD_PRICE),
    0
  ).toFixed(2);

  const formatCurrency = (value) => `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const tableData = sortedPriceHistory.map((entry) => {
    const productName = productMapping[entry.PROD_ID] || "Unknown Product";
    const userName = userMapping[entry.UPDATED_BY_USER_ID] || "Unknown User";

    return [
      productName,
      formatCurrency(entry.OLD_PRICE),
      formatCurrency(entry.NEW_PRICE),
      new Date(entry.CHANGE_DATE).toLocaleDateString(),
      userName,
      <Button onClick={() => handleDetailsClick(entry.PROD_ID)}>Details</Button> // Use Button component
    ];
  });

  const headers = ["Product Name", "Old Price", "New Price", "Change Date", "Updated By", "Action"];

  const handleDetailsClick = (prodId) => {
    const productHistory = PRICE_HISTORY_DATA.filter((entry) => entry.PROD_ID === prodId);
    setSelectedProductHistory(productHistory);
  };

  const closeModal = () => {
    setSelectedProductHistory(null);
  };

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter name or prices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DateContainer>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </DateContainer>
      </Controls>

      <CardsContainer>
        <ReportCard
          label="Total Price Changes"
          value={`${totalChanges} Changes`}
          icon={<FaHistory />}
        />
        <ReportCard
          label="Largest Increase"
          value={parseFloat(maxIncrease) > 0 ? formatCurrency(parseFloat(maxIncrease)) : "₱0.00"}
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Largest Decrease"
          value={parseFloat(maxDecrease) < 0 ? formatCurrency(Math.abs(parseFloat(maxDecrease))) : "₱0.00"}
          icon={<FaDollarSign />}
        />
      </CardsContainer>

      <ReportContent>
        <Table headers={headers} rows={tableData} />
      </ReportContent>

      {/* Modal to display product price history */}
      {selectedProductHistory && (
        <Modal onClose={closeModal} title="Product Price History">
          <PriceHistoryDetails priceHistory={selectedProductHistory} userMapping={userMapping} />
        </Modal>
      )}
    </>
  );
};

// Styled components
const Controls = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;

  label {
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  input {
    margin-left: 0.5rem;
    padding: 0.3rem;
    border-radius: 3px;
    border: 1px solid #ccc;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 0;

    label {
      margin-left: 1rem;
    }
  }
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ReportContent = styled.div`
  margin-top: 20px;
`;

export default SharedPriceHistoryPage;
