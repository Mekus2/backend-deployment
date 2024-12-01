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

// Custom Status Order Mapping
const customStatusOrder = {
  Delivered: 1,
  Dispatched: 2,
  Pending: 3,
  Accepted: 4, // Ensuring "Accepted" is last
};

// Styled Components
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
      : props.status === "Dispatched"
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

const SharedCustomerDeliveryPage = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "OUTBOUND_DEL_SHIPPED_DATE", // Default sorting key
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const customerOrders = await fetchCustomerDelivery();
        setOrders(customerOrders);
        console.info("Fetched Data from API:", customerOrders);
      } catch (err) {
        console.error("Failed fetching Customer Delivery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  // Filter Deliveries based on the search term
  const filteredDeliveries = (orders || []).filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Check if any value in the delivery object contains the search term
    return Object.values(delivery).some((value) => {
      // Ensure the value is not undefined, null, or empty before trying to search
      if (value && value.toString) {
        return value.toString().toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
  });

  // Sorting Deliveries
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

    // Custom sorting for "Status"
    if (sortConfig.key === "OUTBOUND_DEL_STATUS") {
      const statusA = customStatusOrder[a.OUTBOUND_DEL_STATUS] || 0;
      const statusB = customStatusOrder[b.OUTBOUND_DEL_STATUS] || 0;
      return (statusA - statusB) * (sortConfig.direction === "asc" ? 1 : -1);
    }

    return 0;
  });

  // Handle opening and closing modal
  const openDetailsModal = (delivery) => setSelectedDelivery(delivery);
  const closeDetailsModal = () => setSelectedDelivery(null);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Table headers definition
  const headers = [
    { title: "Customer Name", key: "OUTBOUND_DEL_CUSTOMER_NAME" },
    { title: "Status", key: "OUTBOUND_DEL_STATUS" },
    { title: "Location", key: "OUTBOUND_DEL_LOCATION" },
    { title: "Delivery Option", key: "OUTBOUND_DEL_DLVRY_OPTION" },
    { title: "Created Date", key: "OUTBOUND_DEL_CREATED" },
    { title: "Total Price", key: "OUTBOUND_DEL_TOTAL_PRICE" },
    // Commenting out the "Received Date" column for now
    // { title: "Received Date", key: "OUTBOUND_DEL_RECEIVED_DATE" }, // Ensure correct field key
    { title: "Action", key: "action" },
  ];

  // Table rows rendering
  const rows = sortedDeliveries.map((delivery) => [
    delivery.OUTBOUND_DEL_CUSTOMER_NAME || "Unknown",
    <Status status={delivery.OUTBOUND_DEL_STATUS}>
      {delivery.OUTBOUND_DEL_STATUS}
    </Status>,
    `${delivery.OUTBOUND_DEL_CITY || "Unknown"}, ${
      delivery.OUTBOUND_DEL_PROVINCE || "Unknown"
    }`,
    delivery.OUTBOUND_DEL_DLVRY_OPTION || "Not Specified",
    new Date(delivery.OUTBOUND_DEL_CREATED).toLocaleString(),
    `₱${(Number(delivery.OUTBOUND_DEL_TOTAL_PRICE) || 0).toFixed(2)}`,
    // Commented out the received date logic for now
    // delivery.OUTBOUND_DEL_STATUS === "Delivered" && delivery.OUTBOUND_DEL_RECEIVED_DATE
    //   ? new Date(delivery.OUTBOUND_DEL_RECEIVED_DATE).toLocaleString()
    //   : "Not Updated",
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
      <SummarySection>
        <CardTotalCustomerDelivery />
      </SummarySection>
      <Controls>
        <SearchBar
          data-cy="search-bar"
          placeholder="Search / Filter delivery..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <Table
        headers={headers.map((header) => (
          <TableHeader
            key={header.key}
            onClick={
              header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
              header.key === "OUTBOUND_DEL_CSTMR_RCVD_DATE" ||
              header.key === "OUTBOUND_DEL_STATUS"
                ? () => handleSort(header.key)
                : undefined
            }
          >
            {header.title}
            {(header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
              header.key === "OUTBOUND_DEL_DATE_CUST_RCVD" ||
              header.key === "OUTBOUND_DEL_STATUS") && (
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

export default SharedCustomerDeliveryPage;
