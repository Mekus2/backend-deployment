import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SupplierDeliveryDetails from "./SupplierDeliveryDetails";
import { colors } from "../../../colors";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import CardTotalSupplierDelivery from "../../CardsData/CardTotalSupplierDelivery";
import Button from "../../Layout/Button";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { fetchSupplierDelivery } from "../../../api/SupplierDeliveryApi";
import Loading from "../../Layout/Loading"; // Import the loading spinner component

const SharedSupplierDeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "INBOUND_DEL_ORDER_DATE_CREATED",
    direction: "desc", // default to Descending
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchSupplierDelivery();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const filteredDeliveries = (orders || []).filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      (
        formatDate(delivery.INBOUND_DEL_ORDER_DATE_CREATED)?.toLowerCase() || ""
      ).includes(lowerCaseSearchTerm) ||
      (delivery.INBOUND_DEL_STATUS?.toLowerCase() || "").includes(
        lowerCaseSearchTerm
      ) ||
      (delivery.INBOUND_DEL_SUPP_NAME?.toLowerCase() || "").includes(
        lowerCaseSearchTerm
      ) ||
      (delivery.INBOUND_DEL_RCVD_BY_USER_NAME?.toLowerCase() || "").includes(
        lowerCaseSearchTerm
      )
    );
  });

  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    const key = sortConfig.key;
    if (key === "INBOUND_DEL_ORDER_DATE_CREATED") {
      const dateA = a[key] ? new Date(a[key]) : null;
      const dateB = b[key] ? new Date(b[key]) : null;
      return (dateB - dateA) * (sortConfig.direction === "asc" ? 1 : -1);
    }
    return 0;
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
    { title: "Date Created", key: "INBOUND_DEL_ORDER_DATE_CREATED" },
    { title: "Status", key: "INBOUND_DEL_STATUS" },
    { title: "Supplier", key: "SUPPLIER_ID" },
    { title: "Approved By", key: "INBOUND_DEL_ORDER_APPRVDBY_USER" },
    { title: "Action", key: "action" },
  ];

  const rows = sortedDeliveries.map((delivery) => [
    formatDate(delivery.INBOUND_DEL_ORDER_DATE_CREATED),
    <Status status={delivery.INBOUND_DEL_STATUS}>
      {delivery.INBOUND_DEL_STATUS}
    </Status>,
    delivery.INBOUND_DEL_SUPP_NAME,
    delivery.INBOUND_DEL_ORDER_APPRVDBY_USER,
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
      {loading ? (
        <SpinnerWrapper>
          <Loading />
        </SpinnerWrapper>
      ) : (
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
                onClick={
                  header.key === "INBOUND_DEL_ORDER_DATE_CREATED"
                    ? () => handleSort(header.key)
                    : undefined
                }
              >
                {header.title}
                {header.key === "INBOUND_DEL_ORDER_DATE_CREATED" && (
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
            <SupplierDeliveryDetails
              delivery={selectedDelivery}
              onClose={closeDetailsModal}
            />
          )}
        </>
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

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
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
