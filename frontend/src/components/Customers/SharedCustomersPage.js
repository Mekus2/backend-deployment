import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalCustomers from "../CardsData/CardTotalCustomers";
import Button from "../Layout/Button";
import AddCustomerModal from "./AddCustomerModal";
import CustomerDetailsModal from "./CustomerDetailsModal";
import clientsData from "../../data/ClientsData"; // Adjust the import based on your file structure
import { FaPlus } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { colors } from "../../colors";

const SharedCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(clientsData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "CLIENT_NAME",
    direction: "asc",
  });

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = clientsData.filter((customer) => {
      if (!value) return true;
      return (
        customer.CLIENT_NAME.toLowerCase().includes(value) ||
        customer.CLIENT_CITY.toLowerCase().includes(value) ||
        customer.CLIENT_PROVINCE.toLowerCase().includes(value) ||
        customer.CLIENT_PHONENUM.includes(value)
      );
    });
    setFilteredCustomers(filtered);
  };

  const openAddCustomerModal = () => {
    setShowAddModal(true);
  };

  const openDetailsModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowDetailsModal(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = (newCustomer) => {
    setFilteredCustomers([...filteredCustomers, newCustomer]);
  };

  const handleRemoveCustomer = (customerId) => {
    const updatedCustomers = filteredCustomers.filter(
      (customer) => customer.CLIENT_ID !== customerId
    );
    setFilteredCustomers(updatedCustomers);
  };

  const headers = [
    "Customer Name",
    "City",
    "Province",
    "Phone",
    "Action",
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortConfig.key === "CLIENT_NAME") {
      return (
        a.CLIENT_NAME.localeCompare(b.CLIENT_NAME) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }
    return 0;
  });

  const rows = sortedCustomers.map((customer) => [
    customer.CLIENT_NAME,
    customer.CLIENT_CITY,
    customer.CLIENT_PROVINCE,
    customer.CLIENT_PHONENUM,
    <ActionButton key="action" onClick={() => openDetailsModal(customer)}>
      Details
    </ActionButton>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter customer..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <StyledButton onClick={openAddCustomerModal}>
          <FaPlus className="icon" /> Customer
        </StyledButton>
      </Controls>
      <SummarySection>
        <CardTotalCustomers />
      </SummarySection>
      <Table
        headers={headers.map((header, index) => (
          <TableHeader
            key={index}
            onClick={() => {
              if (header === "Customer Name") handleSort("CLIENT_NAME");
            }}
          >
            {header}
            {header === "Customer Name" && (
              <>
                {sortConfig.key === "CLIENT_NAME" ? (
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
      {showAddModal && (
        <AddCustomerModal onClose={closeModals} onAdd={handleAddCustomer} />
      )}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          client={selectedCustomer}
          onClose={closeModals}
          onRemove={handleRemoveCustomer}
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

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const ActionButton = styled(Button)`
  background-color: ${colors.primary};
  &:hover {
    background-color: ${colors.primaryHover};
  }

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const TableHeader = styled.th`
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SharedCustomersPage;
