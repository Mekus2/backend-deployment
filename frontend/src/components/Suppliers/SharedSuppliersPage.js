import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalSuppliers from "../../components/CardsData/CardTotalSuppliers";
import Button from "../../components/Layout/Button";
import AddSupplierModal from "./AddSupplierModal";
import SupplierDetailsModal from "./SupplierDetailsModal";
import { FaPlus } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { colors } from "../../colors";
import { fetchSuppliers } from "../../api/SupplierApi"; // Import the fetchSuppliers function
import axios from "axios"; // Import axios for making requests
import Loading from "../../components/Layout/Loading"; // Import Loading component

const SharedSuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "SUPP_COMPANY_NAME",
    direction: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSuppliers();
        setSuppliers(data);
        setFilteredSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers", error);
      } finally {
        setIsLoading(false); // Stop loading when data is fetched
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.trim().toLowerCase();
    setSearchTerm(value);
    const filtered = suppliers.filter((supplier) => {
      if (!value) return true;
      return (
        supplier.SUPP_COMPANY_NAME?.toLowerCase().includes(value) ||
        supplier.SUPP_COMPANY_NUM.includes(value) ||
        supplier.SUPP_CONTACT_NAME?.toLowerCase().includes(value) ||
        supplier.SUPP_CONTACT_PHNUM.includes(value)
      );
    });
    setFilteredSuppliers(filtered);
  };

  const openAddSupplierModal = () => {
    setShowAddModal(true);
  };

  const openDetailsModal = async (supplier) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/supplier/suppliers/${supplier.id}/`
      );
      console.log("API RESPONSE:", response.data);
      setSelectedSupplier(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowDetailsModal(false);
    setSelectedSupplier(null);
  };

  const handleAddSupplier = (newSupplier) => {
    setFilteredSuppliers([...filteredSuppliers, newSupplier]);
  };

  const handleRemoveSupplier = (supplierId) => {
    const updatedSuppliers = filteredSuppliers.filter(
      (supplier) => supplier.id !== supplierId
    );
    setFilteredSuppliers(updatedSuppliers);
  };

  const headers = [
    "Supplier Name",
    "Supplier Number",
    "Contact Person",
    "Contact Number",
    "Action",
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
    return (
      (a[sortConfig.key] || "").localeCompare(b[sortConfig.key] || "") *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  const rows = sortedSuppliers.map((supplier) => [
    supplier.Supp_Company_Name,
    supplier.Supp_Company_Num,
    supplier.Supp_Contact_Pname,
    supplier.Supp_Contact_Num,
    <ActionButton key="action" onClick={() => openDetailsModal(supplier)}>
      Details
    </ActionButton>,
  ]);

  if (isLoading) {
    return <Loading />; // Display Loading component while fetching data
  }

  return (
    <>
      <SummarySection>
        <CardTotalSuppliers />
      </SummarySection>
      <Controls>
        <SearchBar
          placeholder="Search / Filter supplier..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <StyledButton onClick={openAddSupplierModal}>
          <FaPlus className="icon" /> Supplier
        </StyledButton>
      </Controls>
      <Table
        headers={headers.map((header, index) => (
          <TableHeader
            key={index}
            onClick={() => {
              if (header === "Supplier Name") handleSort("SUPP_COMPANY_NAME");
            }}
          >
            {header}
            {header === "Supplier Name" && (
              <>
                {sortConfig.key === "SUPP_COMPANY_NAME" ? (
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
        <AddSupplierModal onClose={closeModals} onAdd={handleAddSupplier} />
      )}
      {showDetailsModal && selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={closeModals}
          onRemove={handleRemoveSupplier}
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
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
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
`;

const TableHeader = styled.th`
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SharedSuppliersPage;
