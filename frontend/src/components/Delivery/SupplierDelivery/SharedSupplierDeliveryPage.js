import React, { useState } from "react";
import styled from "styled-components";
import SupplierDeliveryDetails from "./SupplierDeliveryDetails";
import { colors } from "../../../colors";
import INBOUND_DELIVERY from "../../../data/InboundData"; // Updated import
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import CardTotalSupplierDelivery from "../../CardsData/CardTotalSupplierDelivery";
import Button from "../../Layout/Button";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

// Function to get Supplier Name by ID
function getSupplierNameById(id) {
  const supplier = INBOUND_DELIVERY.INBOUND_DELIVERY.find(
    (delivery) => delivery.SUPP_ID === id
  )?.SUPPLIER;
  return supplier ? supplier.SUPP_NAME : "Unknown Supplier"; // Handle missing supplier
}

// Function to get User Name by ID
function getUserNameById(userId) {
  const delivery = INBOUND_DELIVERY.INBOUND_DELIVERY.find(
    (d) => d.INBOUND_DEL_RCVD_BY_USER_ID === userId
  );
  if (delivery && delivery.USER) {
    const user = delivery.USER;
    return `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`;
  }
  return "Unknown User"; // Handle missing user
}

const SharedSupplierDeliveryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "INBOUND_DEL_DATECREATED",
    direction: "asc", // default to ascending
  });

  const filteredDeliveries = INBOUND_DELIVERY.INBOUND_DELIVERY.filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      delivery.INBOUND_DEL_DATECREATED.toLowerCase().includes(lowerCaseSearchTerm) ||
      delivery.INBOUND_DEL_STATUS.toLowerCase().includes(lowerCaseSearchTerm) ||
      delivery.SUPPLIER.SUPP_NAME.toLowerCase().includes(lowerCaseSearchTerm) ||
      getUserNameById(delivery.INBOUND_DEL_RCVD_BY_USER_ID).toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    const key = sortConfig.key;
    if (key === "INBOUND_DEL_DATECREATED") {
      const dateA = a[key] ? new Date(a[key]) : null;
      const dateB = b[key] ? new Date(b[key]) : null;
      return (dateB - dateA) * (sortConfig.direction === "asc" ? 1 : -1);
    }
    return 0;
  });

  const openDetailsModal = (delivery) => {
    const deliveryDetails = INBOUND_DELIVERY.INBOUND_DELIVERY_DETAILS.filter(
      (detail) => detail.INBOUND_DEL_ID === delivery.INBOUND_DEL_ID
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

  const headers = [
    { title: "Date Created", key: "INBOUND_DEL_DATECREATED" },
    { title: "Status", key: "INBOUND_DEL_STATUS" },
    { title: "Supplier", key: "SUPPLIER_ID" },
    { title: "Received By", key: "INBOUND_DEL_RCVD_BY_USER_ID" },
    { title: "Action", key: "action" },
  ];

  const rows = sortedDeliveries.map((delivery) => [
    delivery.INBOUND_DEL_DATECREATED,
    <Status status={delivery.INBOUND_DEL_STATUS}>{delivery.INBOUND_DEL_STATUS}</Status>,
    getSupplierNameById(delivery.SUPP_ID),
    getUserNameById(delivery.INBOUND_DEL_RCVD_BY_USER_ID),
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
        <CardTotalSupplierDelivery />
      </SummarySection>
      <Table
        headers={headers.map((header) => (
          <TableHeader
            key={header.key}
            onClick={header.key === "INBOUND_DEL_DATECREATED" ? () => handleSort(header.key) : undefined}
          >
            {header.title}
            {header.key === "INBOUND_DEL_DATECREATED" && (
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
        <SupplierDeliveryDetails
          delivery={selectedDelivery.delivery}
          deliveryDetails={selectedDelivery.deliveryDetails}
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
    props.status === "Received"
      ? "#1DBA0B"
      : props.status === "In Transit"
      ? "#f08400"
      : props.status === "Awaiting"
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

export default SharedSupplierDeliveryPage;
