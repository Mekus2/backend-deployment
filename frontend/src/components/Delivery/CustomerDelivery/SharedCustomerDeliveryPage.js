// Imports
import React, { useState } from "react";
import styled from "styled-components";
import CustomerDeliveryDetails from "./CustomerDeliveryDetails"; // Make sure this is the correct path and is a default export
import { colors } from "../../../colors";
import OUTBOUND_DELIVERY from "../../../data/OutboundData";
import SearchBar from "../../Layout/SearchBar"; // Confirm the default export or change to named export if necessary
import Table from "../../Layout/Table"; // Confirm the default export or change to named export if necessary
import CardTotalCustomerDelivery from "../../CardsData/CardTotalCustomerDelivery"; // Confirm the default export or change to named export if necessary
import Button from "../../Layout/Button"; // Confirm the default export or change to named export if necessary
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const SharedCustomerDeliveryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "OUTBOUND_DEL_SHIPPED_DATE", // Default sorting key
    direction: "asc",
  });

  // Handle status update from the modal
  const handleStatusUpdate = (updatedDelivery) => {
    const updatedDeliveries = OUTBOUND_DELIVERY.OUTBOUND_DELIVERY.map((delivery) => {
      if (delivery.OUTBOUND_DEL_ID === updatedDelivery.OUTBOUND_DEL_ID) {
        return updatedDelivery;
      }
      return delivery;
    });

    // Update the global OUTBOUND_DELIVERY with the new status
    OUTBOUND_DELIVERY.OUTBOUND_DELIVERY = updatedDeliveries;

    if (selectedDelivery && selectedDelivery.delivery.OUTBOUND_DEL_ID === updatedDelivery.OUTBOUND_DEL_ID) {
      setSelectedDelivery({ ...selectedDelivery, delivery: updatedDelivery });
    }
  };

  // Filter and search deliveries across all fields
  const filteredDeliveries = OUTBOUND_DELIVERY.OUTBOUND_DELIVERY.filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return Object.values(delivery).some((value) =>
      value && value.toString().toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Sort deliveries by date only
  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    if (sortConfig.key === "OUTBOUND_DEL_SHIPPED_DATE" || sortConfig.key === "OUTBOUND_DEL_DATE_CUST_RCVD") {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : null;
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : null;

      if (!dateA || !dateB) return !dateA ? 1 : -1; // Handle null dates
      return (dateB - dateA) * (sortConfig.direction === "asc" ? 1 : -1);
    }
    return 0;
  });

  // Open the details modal with selected delivery and details
  const openDetailsModal = (delivery) => {
    const deliveryDetails = OUTBOUND_DELIVERY.OUTBOUND_DELIVERY_DETAILS.filter(
      (detail) => detail.OUTBOUND_DEL_ID === delivery.OUTBOUND_DEL_ID
    );
    setSelectedDelivery({ delivery, deliveryDetails });
  };

  const closeDetailsModal = () => setSelectedDelivery(null);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Update headers to only include the required fields
  const headers = [
    { title: "Shipped Date", key: "OUTBOUND_DEL_SHIPPED_DATE" },
    { title: "Received Date", key: "OUTBOUND_DEL_DATE_CUST_RCVD" },
    { title: "Status", key: "OUTBOUND_DEL_STATUS" },
    { title: "Quantity", key: "OUTBOUND_DEL_DLVRY_QTY" },
    { title: "Customer Name", key: "CUSTOMER_NAME" },
    { title: "Action", key: "action" },
  ];

  // Update rows to display the relevant columns
  const rows = sortedDeliveries.map((delivery) => [
    delivery.OUTBOUND_DEL_SHIPPED_DATE,
    delivery.OUTBOUND_DEL_DATE_CUST_RCVD || "Not Received",
    <Status status={delivery.OUTBOUND_DEL_STATUS}>{delivery.OUTBOUND_DEL_STATUS}</Status>,
    delivery.OUTBOUND_DEL_DLVRY_QTY,
    delivery.CUSTOMER_NAME,
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
        <CardTotalCustomerDelivery />
      </SummarySection>
      <Table
        headers={headers.map((header) => (
          <TableHeader
            key={header.key}
            onClick={
              header.key === "OUTBOUND_DEL_SHIPPED_DATE" || header.key === "OUTBOUND_DEL_DATE_CUST_RCVD"
                ? () => handleSort(header.key)
                : undefined
            }
          >
            {header.title}
            {(header.key === "OUTBOUND_DEL_SHIPPED_DATE" || header.key === "OUTBOUND_DEL_DATE_CUST_RCVD") && (
              <>
                {sortConfig.key === header.key ? (
                  sortConfig.direction === "asc" ? (
                    <FaChevronUp style={{ marginLeft: "5px", fontSize: "12px" }} />
                  ) : (
                    <FaChevronDown style={{ marginLeft: "5px", fontSize: "12px" }} />
                  )
                ) : (
                  <span style={{ opacity: 0.5 }}>
                    <FaChevronUp style={{ marginLeft: "5px", fontSize: "12px" }} />
                    <FaChevronDown style={{ marginLeft: "5px", fontSize: "12px" }} />
                  </span>
                )}
              </>
            )}
          </TableHeader>
        ))}
        rows={rows}
      />
      {selectedDelivery && (
        <CustomerDeliveryDetails
          delivery={selectedDelivery.delivery}
          deliveryDetails={selectedDelivery.deliveryDetails}
          onClose={closeDetailsModal}
          onStatusUpdate={handleStatusUpdate}
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
    props.status === "Delivered"
      ? "#1DBA0B"
      : props.status === "In Transit"
        ? "#f08400"
        : props.status === "Pending"
          ? "#ff5757"
          : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const TableHeader = styled.th`
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SharedCustomerDeliveryPage;
