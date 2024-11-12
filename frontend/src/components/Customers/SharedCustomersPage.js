import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalCustomers from "../CardsData/CardTotalCustomers";
import Button from "../Layout/Button";
import AddCustomerModal from "./AddCustomerModal";
import CustomerDetailsModal from "./CustomerDetailsModal";
import { FaPlus } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { colors } from "../../colors";
import { fetchCustomers } from "../../api/CustomerApi"; // Import the fetchCustomers function
import axios from "axios"; // Import axios for making requests

const SharedCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = customers.filter((customer) => {
      if (!value) return true;
      return (
        customer.name.toLowerCase().includes(value) ||
        customer.address.toLowerCase().includes(value) ||
        customer.province.toLowerCase().includes(value) ||
        customer.phoneNumber.includes(value)
      );
    });
    setFilteredCustomers(filtered);
  };

  const openAddCustomerModal = () => {
    setShowAddModal(true);
  };


  useEffect(() => {
    console.log('Selected Customer:', selectedCustomer);
  }, [selectedCustomer]);

  // Fetch customer by ID and open details modal
  const openDetailsModal = async (customer) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/customer/clients/${customer.id}/`);
    console.log('API Response:', response.data); // Log the response to check if the data is correct
    setSelectedCustomer(response.data); // Set the fetched data into state
    setShowDetailsModal(true);
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
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
      (customer) => customer.id !== customerId
    );
    setFilteredCustomers(updatedCustomers);
  };

  const headers = [
    "Customer Name",
    "Address",
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
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
    return (
      (a[sortConfig.key] || "").localeCompare(b[sortConfig.key] || "") *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  const rows = sortedCustomers.map((customer) => [
    customer.name,
    customer.address,
    customer.province,
    customer.phoneNumber,
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
              if (header === "Customer Name") handleSort("name");
            }}
          >
            {header}
            {header === "Customer Name" && (
              <>
                {sortConfig.key === "name" ? (
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
