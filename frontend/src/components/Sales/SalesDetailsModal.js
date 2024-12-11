import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";
import Button from "../Layout/Button"; // Assuming Button is located at this path

// Utility function to format numbers as currency
const formatCurrency = (value) => {
  // Ensure the value is a valid number
  const numberValue = typeof value === "number" && !isNaN(value) ? value : 0;
  return `₱${numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const SalesDetailsModal = ({ sale, onClose }) => {
  console.log("Received Sales detail:", sale);
  const [amountPaid, setAmountPaid] = useState(
    sale.SALES_INV_AMOUNT_PAID || ""
  );
  const [paymentTerms, setPaymentTerms] = useState(
    sale.SALES_INV_PYMNT_TERMS || ""
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAmountPaidChange = (value) => {
    const sanitizedValue = value === "0" ? "" : value; // Remove default zero
    setAmountPaid(sanitizedValue);
    setHasChanges(true);
  };

  const handlePaymentTermsChange = (value) => {
    setPaymentTerms(value);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!amountPaid || isNaN(amountPaid)) {
      alert("Please enter a valid amount paid.");
      return;
    }

    const updatedInvoiceData = {
      SALES_INV_AMOUNT_PAID: amountPaid,
      SALES_INV_PYMNT_TERMS: paymentTerms,
    };

    try {
      let invoice_Id = sale.SALES_INV_ID;
      // Send a PATCH request to update the sales invoice on the server
      const response = await fetch(
        `http://localhost:8000/sales/${invoice_Id}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedInvoiceData),
        }
      );

      if (response.ok) {
        const updatedSale = await response.json();
        console.log("Invoice updated:", updatedSale);

        // Optionally update local state or notify the user
        alert("Invoice successfully updated.");
        onClose(); // Close the modal after saving
      } else {
        alert("Failed to update the invoice.");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("An error occurred while updating the invoice.");
    }

    setHasChanges(false);
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    setHasChanges(false);
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>

        <Title>Sales Invoice</Title>

        {/* Invoice Details Section */}
        <DetailsContainer>
          <DetailsColumn>
            <Detail>
              <strong>Invoice ID:</strong> {sale.SALES_INV_ID || "N/A"}
            </Detail>
            <Detail>
              <strong>Delivery ID:</strong> {sale.OUTBOUND_DEL_ID || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Customer Name:</strong> {sale.CLIENT_NAME || "N/A"}
            </Detail>
            <Detail>
              <strong>Payment Status:</strong>{" "}
              {sale.SALES_INV_PYMNT_STATUS || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Balance:</strong> {sale.SALES_INV_AMOUNT_BALANCE || 0}
            </Detail>
            <Detail>
              <strong>Payment Terms (Days):</strong>
            </Detail>
            <Detail>
              <StyledInput
                type="number"
                value={paymentTerms}
                onChange={(e) => handlePaymentTermsChange(e.target.value)}
                disabled={!isEditMode}
              />
              {isEditMode}
            </Detail>
          </DetailsColumn>
        </DetailsContainer>

        {/* Product Details Table */}
        <ProductTable>
          <thead>
            <tr>
              <TableHeader>Product Name</TableHeader>
              <TableHeader>Qty</TableHeader>
              <TableHeader>Sell Price</TableHeader>
              <TableHeader>Purchase Price</TableHeader>
              <TableHeader>Total</TableHeader>
            </tr>
          </thead>
          <tbody>
            {/* Static Table Data */}
            <TableRow>
              <TableCell>Product A</TableCell>
              <TableCell>2</TableCell>
              <TableCell>{formatCurrency(500)}</TableCell>
              <TableCell>{formatCurrency(300)}</TableCell>
              <TableCell>{formatCurrency(1000)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Product B</TableCell>
              <TableCell>1</TableCell>
              <TableCell>{formatCurrency(700)}</TableCell>
              <TableCell>{formatCurrency(400)}</TableCell>
              <TableCell>{formatCurrency(700)}</TableCell>
            </TableRow>
          </tbody>
        </ProductTable>

        {/* Summary Section */}
        <SummarySection>
          <GrandTotal>
            <strong>Grand Total:</strong> {formatCurrency(1700)}
          </GrandTotal>

          {/* Amount Paid Section */}
          <AmountPaidContainer>
            <Label>
              <strong>Amount Paid:</strong>
            </Label>
            <StyledInput
              type="number"
              value={amountPaid}
              onChange={(e) => handleAmountPaidChange(e.target.value)}
              disabled={!isEditMode}
            />
          </AmountPaidContainer>
        </SummarySection>

        {/* Update Invoice Button */}
        <SaveButtonContainer>
          {isEditMode ? (
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          ) : (
            <Button
              onClick={handleEditModeToggle}
              style={{ backgroundColor: "#1DBA0B" }}
            >
              Update Invoice
            </Button>
          )}
        </SaveButtonContainer>
      </Modal>
    </Backdrop>
  );
};

// Styled components

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 700px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Title = styled.h1`
  text-align: left;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.8rem;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const DetailsColumn = styled.div`
  flex: 1;
  padding: 0 10px;
  text-align: left;
`;

const Detail = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin: 15px 0;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const SummarySection = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const GrandTotal = styled.div`
  font-size: 1rem;
`;

const AmountPaidContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
`;

const Label = styled.div`
  margin-right: 10px;
`;

const StyledInput = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
  width: 150px;
  font-size: 14px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0px 0px 6px rgba(0, 123, 255, 0.5);
  }
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export default SalesDetailsModal;
