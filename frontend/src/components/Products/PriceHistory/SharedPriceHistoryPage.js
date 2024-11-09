import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import ReportCard from "../../Layout/ReportCard";
import Button from "../../Layout/Button";
import { FaHistory } from "react-icons/fa";
import productData from "../../../data/ProductData";
import PRICE_HISTORY_DATA from "../../../data/PriceHistoryData";
import Modal from "../../Layout/Modal";
import PriceHistoryDetails from "./PriceHistoryDetails";

const SharedPriceHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProductHistory, setSelectedProductHistory] = useState(null);

  const productMapping = Object.fromEntries(
    productData.PRODUCT.map((product) => [product.PROD_ID, product.PROD_NAME])
  );

  const filteredPriceHistory = PRICE_HISTORY_DATA.filter((entry) => {
    const productName = productMapping[entry.PROD_ID] || "Unknown Product";
    const oldPrice = entry.OLD_PRICE.toFixed(2);
    const newPrice = entry.NEW_PRICE.toFixed(2);
    const changeDate = new Date(entry.CHANGE_DATE).toLocaleDateString();

    const matchesSearchTerm =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const formatCurrency = (value) => `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const tableData = sortedPriceHistory.map((entry) => {
    const productName = productMapping[entry.PROD_ID] || "Unknown Product";

    return [
      productName,
      formatCurrency(entry.OLD_PRICE),
      formatCurrency(entry.NEW_PRICE),
      new Date(entry.CHANGE_DATE).toLocaleDateString(),
      <Button onClick={() => handleDetailsClick(entry.PROD_ID)}>Details</Button>
    ];
  });

  const headers = ["Product Name", "Old Price", "New Price", "Change Date", "Action"];

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
      </CardsContainer>

      <ReportContent>
        <Table headers={headers} rows={tableData} />
      </ReportContent>

      {selectedProductHistory && (
        <Modal onClose={closeModal} title="Product Price History">
          <PriceHistoryDetails priceHistory={selectedProductHistory} />
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
