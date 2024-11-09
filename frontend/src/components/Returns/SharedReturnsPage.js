import React, { useState } from "react";
import styled from "styled-components";
import ReturnDetailModal from "../../components/Returns/ReturnDetailModal";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import returnsData from "../../data/ReturnsData";
import Button from "../../components/Layout/Button";

const SharedReturnsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);

  const filteredReturns = returnsData
    .filter((returnItem) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        returnItem.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        returnItem.returnDate.toLowerCase().includes(lowerCaseSearchTerm) ||
        returnItem.type.toLowerCase().includes(lowerCaseSearchTerm) ||
        returnItem.status.toLowerCase().includes(lowerCaseSearchTerm)
      );
    })
    .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate)); // Sort by return date descending

  const totalReturns = filteredReturns.length;

  const openDetailModal = (returnItem) => setSelectedReturn(returnItem);
  const closeDetailModal = () => setSelectedReturn(null);

  const handleCancelReturn = (returnId) => {
    // Logic to cancel the return, e.g., update state or call API
    console.log(`Return with ID ${returnId} has been cancelled.`);
    // Example: Update the local state to reflect the cancellation
    setSelectedReturn(null); // Close the modal after cancel
  };

  // Updated headers to remove the "ID" column
  const headers = ["Name", "Return Date", "Type", "Status", "Actions"];
  const rows = filteredReturns.map((returnItem) => [
    returnItem.name,
    returnItem.returnDate,
    returnItem.type,
    <Status status={returnItem.status} key={returnItem.id}>
      {returnItem.status}
    </Status>,
    <Button bgColor="#00C4FF" onClick={() => openDetailModal(returnItem)}>
      View
    </Button>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter returns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <AnalyticsContainer>
        <CardTotalReturns totalReturns={totalReturns} />
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
      {selectedReturn && (
        <ReturnDetailModal
          returnItem={selectedReturn}
          onClose={closeDetailModal}
          onCancelReturn={handleCancelReturn} // Passing the cancel function here
        />
      )}
    </>
  );
};

// Styled components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const Status = styled.span`
  background-color: ${(props) =>
    props.status === "Completed"
      ? "#1DBA0B"
      : props.status === "Processing"
      ? "#00C4FF"
      : props.status === "Pending"
      ? "#f08400"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

export default SharedReturnsPage;
