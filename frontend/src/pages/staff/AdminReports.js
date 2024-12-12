import React, { useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import styled from "styled-components";
import SupplierOrderReport from "../../components/Reports/SupplierOrderReport";
import CustomerOrderReport from "../../components/Reports/CustomerOrderReport";
import AllOrderReport from "../../components/Reports/AllOrderReport"; // Import the AllOrderReport component
import Button from "../../components/Layout/Button"; // For the tab buttons
import { colors } from "../../colors"; // Ensure colors are correctly imported

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState("Daily Stock Report");

  // Function to render the report body based on the active tab
  const renderActiveReport = () => {
    switch (activeTab) {
      case "Daily Stock Report":
        return <AllOrderReport />;
      case "Customer Order Report":
        return <CustomerOrderReport />;
      case "Supplier Order Report":
        return <SupplierOrderReport />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Tabs>
        <StyledTabButton
          active={activeTab === "Daily Stock Report"}
          onClick={() => setActiveTab("Daily Stock Report")}
        >
          Daily Stock Report
        </StyledTabButton>

        <StyledTabButton
          active={activeTab === "Supplier Order Report"}
          onClick={() => setActiveTab("Supplier Order Report")}
        >
          Supplier Order Report
        </StyledTabButton>

        <StyledTabButton
          active={activeTab === "Customer Order Report"}
          onClick={() => setActiveTab("Customer Order Report")}
        >
          Customer Order Report
        </StyledTabButton>
      </Tabs>
      {renderActiveReport()} {/* Render the report based on active tab */}
    </MainLayout>
  );
};

// Styled components for tabs layout
const Tabs = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const StyledTabButton = styled(Button)`
  background-color: ${(props) =>
    props.active
      ? colors.primary
      : "#e0e0e0"}; /* Use primary for active, grey for inactive */
  color: ${(props) => (props.active ? "#fff" : "#000")};
  &:hover {
    background-color: ${(props) =>
      props.active
        ? colors.primaryHover
        : "#c0c0c0"}; // Use primaryHover for active hover
  }
`;

export default AdminReports;
