import React from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import Button from "../Layout/Button";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";

const ReportBody = ({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  headers,
  rows,
  totalOrders,
  totalOrderValue,
  onDownloadPDF,
  onPreviewExcel,
}) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <CardsContainer>
        <ReportCard
          label={`Total Orders`}
          value={`${totalOrders} Orders`}
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaShoppingCart />}
        />
        <ReportCard
          label={`Order Value`}
          value={`₱${totalOrderValue.toFixed(2)}`} // Keep peso sign in the value
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaDollarSign />}
        />
      </CardsContainer>
      <Controls>
        <SearchBar
          placeholder="Search reports..."
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

      <ReportContent>
        <Table headers={headers} rows={rows} />
      </ReportContent>

      <DownloadButtons>
        <Button variant="primary" onClick={onDownloadPDF}>
          Preview PDF
        </Button>
        <Button variant="primary" onClick={onPreviewExcel}>
          Preview Excel
        </Button>
      </DownloadButtons>
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
    justify-content: center;
  }
`;

const ReportContent = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 200px;
  text-align: center;
`;

const DownloadButtons = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

export default ReportBody;
