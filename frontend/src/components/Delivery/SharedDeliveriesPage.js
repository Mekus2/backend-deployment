import React, { useState } from "react";
import styled from "styled-components";
import DeliveryDetailsModal from "../../components/Delivery/DeliveryDetailsModal";
import { colors } from "../../colors";
import { DELIVERY } from "../../data/DeliveryData"; // Updated import to match the new data structure
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import Button from "../../components/Layout/Button"; // Import the Button component
import { FaChevronUp, FaChevronDown } from "react-icons/fa"; // Import chevron icons

const SharedDeliveriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "DELIVERY_NAME", // Updated key to match the new uppercase field
    direction: "asc",
  });

  const filteredDeliveries = DELIVERY.filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      delivery.DELIVERY_NAME.toLowerCase().includes(lowerCaseSearchTerm) ||
      delivery.DELIVERY_DATE.toLowerCase().includes(lowerCaseSearchTerm) ||
      delivery.DELIVERY_TYPE.toLowerCase().includes(lowerCaseSearchTerm) ||
      delivery.DELIVERY_STATUS.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Sort filtered deliveries based on sortConfig
  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    if (sortConfig.key === "DELIVERY_DATE") {
      return (
        (new Date(b.DELIVERY_DATE) - new Date(a.DELIVERY_DATE)) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }
    return (
      a.DELIVERY_NAME.localeCompare(b.DELIVERY_NAME) *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  const openDetailsModal = (delivery) => setSelectedDelivery(delivery);
  const closeDetailsModal = () => setSelectedDelivery(null);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const headers = [
    { title: "Name", key: "DELIVERY_NAME" }, // Updated key to uppercase field
    { title: "Order Date", key: "DELIVERY_DATE" }, // Updated key to uppercase field
    { title: "Type", key: "DELIVERY_TYPE" }, // Updated key to uppercase field
    { title: "Status", key: "DELIVERY_STATUS" }, // Updated key to uppercase field
    { title: "Action", key: "action" },
  ];

  const rows = sortedDeliveries.map((delivery) => [
    delivery.DELIVERY_NAME,
    delivery.DELIVERY_DATE,
    delivery.DELIVERY_TYPE,
    <Status status={delivery.DELIVERY_STATUS}>{delivery.DELIVERY_STATUS}</Status>,
    <Button
      data-cy="details-button"
      backgroundColor={colors.primary}
      hoverColor={colors.primaryHover}
      onClick={() => openDetailsModal(delivery)}
    >
      Details
    </Button>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          data-cy="search-bar"
          placeholder="Search / Filter delivery..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <SummarySection>
        <CardTotalDelivery />
      </SummarySection>
      <Table
        headers={headers.map((header) => (
          <TableHeader
            key={header.key}
            onClick={
              header.key === "DELIVERY_NAME" || header.key === "DELIVERY_DATE"
                ? () => handleSort(header.key)
                : undefined
            }
          >
            {header.title}
            {(header.key === "DELIVERY_DATE" || header.key === "DELIVERY_NAME") && (
              <>
                {sortConfig.key === header.key ? (
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
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={closeDetailsModal}
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

const SummarySection = styled.div`
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
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

const TableHeader = styled.th`
  text-align: center; /* Center the header text */
  cursor: pointer; /* Change cursor to pointer */
  display: flex; /* Use flex to align items */
  justify-content: center; /* Center content */
  align-items: center; /* Center vertically */
`;

export default SharedDeliveriesPage;
