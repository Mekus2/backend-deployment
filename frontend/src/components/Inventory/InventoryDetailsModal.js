import React from "react";
import Modal from "../Layout/Modal"; // Ensure the path to Modal is correct
import styled from "styled-components";
import Button from "../Layout/Button"; // Import the Button component
import productData from "../../data/ProductData"; // Ensure the path is correct

const InventoryDetailsModal = ({ item, onClose }) => {
  if (!item) return null;

  // const product = productData.PRODUCT.find((p) => p.PROD_ID === item.PROD_ID);
  // const productDetails = productData.PRODUCT_DETAILS.find(
  //   (pd) => pd.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
  // );

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      `Are you sure you want to remove this item?`
    );
    if (confirmRemoval) {
      // Implement remove logic here
      alert(`Item ${item.PRODUCT_NAME} removed`);
      onClose(); // Close the modal after removal
    }
  };

  return (
    <Modal
      title={`${item.PRODUCT_NAME} Details`}
      status={item.PROD_INV_QTY_ON_HAND > 0 ? "Available" : "Out of Stock"}
      onClose={onClose}
    >
      <Section>
      <Detail>
          <DetailLabel>Inventory Id:</DetailLabel> {item.INVENTORY_ID}
        </Detail>
        <Detail>
          <DetailLabel>Batch Id:</DetailLabel> {item.BATCH_ID}
        </Detail>
        <Detail>
        <Detail>
          <DetailLabel>Product Id:</DetailLabel> {item.PRODUCT_ID}
        </Detail>
      </Detail>
        <Detail>
        <DetailLabel>Expiry Date:</DetailLabel>{" "}
        {new Date(item.EXPIRY_DATE).toLocaleDateString()}
        </Detail>
        <Detail>
        <DetailLabel>Inbound Delivery Id:</DetailLabel> {item.INBOUND_DEL_ID}
        </Detail>
        <Detail>
          <DetailLabel>Quantity on Hand:</DetailLabel> {item.QUANTITY_ON_HAND}
        </Detail>
      </Section>
      <ButtonGroup>
        <Button variant="red" onClick={handleRemove}>
          Remove
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

// Styled Components

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align to the left */
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
`;

const Detail = styled.div`
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export default InventoryDetailsModal;
