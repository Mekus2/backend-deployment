// Imports
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CustomerDeliveryDetails from "./CustomerDeliveryDetails"; // Ensure correct path
import { colors } from "../../../colors";
import SearchBar from "../../Layout/SearchBar"; // Ensure correct export
import Table from "../../Layout/Table"; // Ensure correct export
import CardTotalCustomerDelivery from "../../CardsData/CardTotalCustomerDelivery"; // Ensure correct export
import Button from "../../Layout/Button"; // Ensure correct export
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import Loading from "../../Layout/Loading"; // Import Loading component
import { fetchCustomerDelivery } from "../../../api/CustomerDeliveryApi";

const SharedCustomerDeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "OUTBOUND_DEL_SHIPPED_DATE", // Default sorting key
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const CustomerOrder = await fetchCustomerDelivery();
        setOrders(CustomerOrder);
        console.info("Fetched Data from API:", CustomerOrder);
      } catch (err) {
        console.error("Failed fetching Customer Delivery");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  const filteredDeliveries = (orders || []).filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return Object.values(delivery).some(
      (value) =>
        value && value.toString().toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    if (
      sortConfig.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
      sortConfig.key === "OUTBOUND_DEL_DATE_CUST_RCVD"
    ) {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : null;
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : null;

      if (!dateA || !dateB) return !dateA ? 1 : -1;
      return (dateB - dateA) * (sortConfig.direction === "asc" ? 1 : -1);
    }
    return 0;
  });

  const openDetailsModal = (delivery) => {
    setSelectedDelivery(delivery);
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
    { title: "Shipped Date", key: "OUTBOUND_DEL_SHIPPED_DATE" },
    { title: "Received Date", key: "OUTBOUND_DEL_DATE_CUST_RCVD" },
    { title: "Status", key: "OUTBOUND_DEL_STATUS" },
    { title: "Delivered Qty", key: "OUTBOUND_DEL_DLVRD_QTY" },
    { title: "Customer Name", key: "CUSTOMER_NAME" },
    { title: "Action", key: "action" },
  ];

  const rows = sortedDeliveries.map((delivery) => [
    delivery.OUTBOUND_DEL_SHIPPED_DATE || "Not Shipped",
    delivery.OUTBOUND_DEL_CSTMR_RCVD_DATE || "Not Received",
    <Status status={delivery.OUTBOUND_DEL_STATUS}>
      {delivery.OUTBOUND_DEL_STATUS}
    </Status>,
    delivery.OUTBOUND_DEL_DLVRD_QTY,
    delivery.OUTBOUND_DEL_CUSTOMER_NAME,
    <Button
      data-cy="details-button"
      backgroundColor={colors.primary}
      hoverColor={colors.primaryHover}
      onClick={() => openDetailsModal(delivery)}
    >
      Details
    </Button>,
  ]);

  // Show loading spinner while fetching data
  if (loading) {
    return <Loading />;
  }

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
              header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
              header.key === "OUTBOUND_DEL_CSTMR_RCVD_DATE"
                ? () => handleSort(header.key)
                : undefined
            }
          >
            {header.title}
            {(header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
              header.key === "OUTBOUND_DEL_DATE_CUST_RCVD") && (
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
        <CustomerDeliveryDetails
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
