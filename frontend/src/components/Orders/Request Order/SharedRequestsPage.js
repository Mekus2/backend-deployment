import React, { useState } from "react";
import styled from "styled-components";
import RequestDetailsModal from "../../../components/Orders/Request Order/RequestDetailsModal";
import AddRequestModal from "../../../components/Orders/Request Order/AddRequestModal";
import SearchBar from "../../../components/Layout/SearchBar";
import Table from "../../../components/Layout/Table";
import CardTotalPendingRequest from "../../CardsData/CardTotalRequestOrder";
import Button from "../../../components/Layout/Button";
import { requests as initialRequests } from "../../../data/RequestOrderData"; // Ensure this path is correct
import { FaPlus } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa"; // Import chevron icons

const SharedRequestsPage = ({ showRequestButton }) => { // Accept prop
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "requestDate",
    direction: "desc",
  }); // Default sorting set to Request Date (latest first)
  const [statusFilter, setStatusFilter] = useState("Pending"); // Initial filter set to Pending

  // Filter requests by search term
  const filteredRequests = requests.filter((request) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      request.requestBy.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.requestDate.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.status.toLowerCase().includes(lowerCaseSearchTerm) // Include status in the search
    );
  });

  // Sort requests based on sortConfig
  const sortedRequests = filteredRequests.sort((a, b) => {
    if (sortConfig.key === "status") {
      const statusOrder = { Completed: 1, Pending: 2, Cancelled: 3 };
      return (
        (statusOrder[a[sortConfig.key]] - statusOrder[b[sortConfig.key]]) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }

    if (sortConfig.key === "requestBy") {
      const compare = a.requestBy.localeCompare(b.requestBy);
      return compare * (sortConfig.direction === "asc" ? 1 : -1);
    }

    // Default to sorting by date (latest first)
    return (
      (new Date(b.requestDate) - new Date(a.requestDate)) *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  const openDetailsModal = (request) => setSelectedRequest(request);
  const closeDetailsModal = () => setSelectedRequest(null);

  const openAddRequestModal = () => setIsAddingRequest(true);
  const closeAddRequestModal = () => setIsAddingRequest(false);

  const handleSaveNewRequest = (newRequest) => {
    setRequests([...requests, newRequest]);
    closeAddRequestModal();
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusToggle = () => {
    const statuses = ["Pending", "Completed", "Cancelled"];
    const currentIndex = statuses.indexOf(statusFilter);
    const nextIndex = (currentIndex + 1) % statuses.length; // Cycle through statuses
    setStatusFilter(statuses[nextIndex]);
  };

  const headers = [
    { label: "Request By", key: "requestBy" },
    { label: "Request Date", key: "requestDate" },
    { label: "Status", key: "status" },
    { label: "Action" },
  ];

  const rows = sortedRequests.map((request) => [
    request.requestBy,
    request.requestDate,
    <Status status={request.status}>{request.status}</Status>,
    <Button onClick={() => openDetailsModal(request)} fontSize="14px">
      Details
    </Button>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Conditionally render the Request button */}
        {showRequestButton && (
          <StyledButton onClick={openAddRequestModal}>
            <FaPlus className="icon" /> Request Order
          </StyledButton>
        )}
      </Controls>
      <AnalyticsContainer>
        <CardTotalPendingRequest />
      </AnalyticsContainer>

      {/* Render the table with all requests, sorted with latest date first */}
      <Table
        headers={headers.map((header) => (
          <TableHeader
            onClick={() => {
              if (header.key === "status") {
                handleStatusToggle(); // Toggle status when clicking on Status header
              } else if (
                header.key === "requestBy" ||
                header.key === "requestDate"
              ) {
                handleSort(header.key);
              }
            }}
            key={header.key}
          >
            {header.label}
            {/* Display chevrons only for Request By and Request Date */}
            {(header.key === "requestBy" || header.key === "requestDate") && (
              <>
                {header.key === sortConfig.key ? (
                  sortConfig.direction === "asc" ? (
                    <FaChevronUp
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  ) : (
                    <FaChevronDown
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  )
                ) : (
                  <span style={{ opacity: 0.5 }}>
                    <FaChevronUp
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                    <FaChevronDown
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  </span>
                )}
              </>
            )}
          </TableHeader>
        ))}
        rows={rows}
      />
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={closeDetailsModal}
        />
      )}
      {isAddingRequest && (
        <AddRequestModal
          onClose={closeAddRequestModal}
          onSave={handleSaveNewRequest}
        />
      )}
    </>
  );
};

// Styled Components
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
      : props.status === "Pending"
      ? "#f08400"
      : props.status === "Cancelled"
      ? "#ff5757"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const TableHeader = styled.th`
  text-align: center; /* Center the header text */
  cursor: pointer; /* Change cursor to pointer */
  display: flex; /* Use flex to align items */
  justify-content: center; /* Center content */
  align-items: center; /* Center vertically */
`;

export default SharedRequestsPage;
