import React from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";

// Utility function to format numbers as currency
const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

const SalesDetailsModal = ({ sale = {}, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const calculateSubTotal = () => {
    if (!sale.orderDetails) return 0;
    return sale.orderDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTotalAfterDiscount = () => {
    const subTotal = calculateSubTotal();
    if (!sale.discount) return subTotal;
    if (typeof sale.discount === "string" && sale.discount.includes("%")) {
      const discountPercentage = parseFloat(sale.discount) / 100;
      return subTotal - subTotal * discountPercentage;
    } else {
      return subTotal - parseFloat(sale.discount);
    }
  };

  const calculateTotalQuantity = () => {
    if (!sale.orderDetails) return 0;
    return sale.orderDetails.reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>

        <Title>Sales Details</Title>

        <DetailsContainer>
          <Column align="left">
            <FormGroup>
              <Label>Invoice ID:</Label>
              <Value>{sale.SALES_INV_ID || ""}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Date/Time:</Label>
              <Value>{sale.SALES_INV_DATETIME || ""}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Client ID:</Label>
              <Value>{sale.CLIENT_ID || ""}</Value>
            </FormGroup>
          </Column>

          <Column align="right">
            <FormGroup>
              <Label>Status:</Label>
              <Status status={sale.status || "Unknown"}>
                {sale.status || "Unknown"}
                <CompletedDate>{sale.completedDate || ""}</CompletedDate>
              </Status>
            </FormGroup>
          </Column>
        </DetailsContainer>

        <FormGroup>
          <DescriptionBox>
            <p>{sale.description || "No description available."}</p>
          </DescriptionBox>
        </FormGroup> 
        
        <ProductTable>
          <thead>
            <tr>
              <TableHeader>Product Name</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Price</TableHeader>
            </tr>
          </thead>
          <tbody>
            {(sale.orderDetails || []).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName || ""}</TableCell>
                <TableCell>{item.quantity || 0}</TableCell>
                <TableCell>{formatCurrency(item.price || 0)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </ProductTable>

        <FormSection>
          <FormGroup>
            <Label>Order Sub Total:</Label>
            <Value>{formatCurrency(calculateSubTotal())}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Total Quantity:</Label>
            <Value>{calculateTotalQuantity()}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Discount:</Label>
            <Discount>{sale.discount || ""}</Discount>
          </FormGroup>
          <FormGroup>
            <Label>Order Total:</Label>
            <Total>{formatCurrency(calculateTotalAfterDiscount())}</Total>
          </FormGroup>
        </FormSection>
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
  max-width: 600px;
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

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Column = styled.div`
  width: 48%;
  text-align: ${(props) => props.align || "left"};
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Label = styled.div`
  font-weight: bold;
  color: black;
`;

const Value = styled.div`
  color: ${colors.text};
`;

const Discount = styled.div`
  color: #ff5757;
  font-weight: bold;
`;

const Total = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #1dba0b;
`;

const Status = styled.span`
  background-color: ${(props) =>
    props.status === "Approved" ||
    props.status === "Received" ||
    props.status === "Delivered"
      ? "#1DBA0B"
      : props.status === "Shipped"
      ? "#f08400"
      : props.status === "Cancelled"
      ? "#ff5757"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const CompletedDate = styled.div`
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 15px;
  margin-bottom: 20px;
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

const FormSection = styled.div`
  margin-top: 20px;
`;

const DescriptionBox = styled.div`
  border: 1px solid #3b3b3bf7;
  border-radius: 4px;
  padding: 10px;
  max-height: 100px;
  overflow-y: auto;
  width: 100%;
  text-align: left;
  background: #f9f9f9;
`;

export default SalesDetailsModal;
