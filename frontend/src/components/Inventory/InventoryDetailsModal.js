import React, { useEffect, useState } from "react";
import Modal from "../Layout/Modal"; // Ensure the path to Modal is correct
import styled from "styled-components";
import Button from "../Layout/Button"; // Import the Button component

const InventoryDetailsModal = ({ item, onClose }) => {
  const [reorderLevel, setReorderLevel] = useState(null);

  const prodId = item.PRODUCT_ID;

  // Fetch the reorder level for the specific product ID
  // Fetch the reorder level for the specific product ID
  useEffect(() => {
    if (prodId) {
      fetch(`http://127.0.0.1:8000/items/productList/${prodId}/`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch product data");
          }
          return response.json();
        })
        .then((data) => {
          setReorderLevel(data.PROD_RO_LEVEL);
          console.log('RO LEVEL:', data.PROD_RO_LEVEL)
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
          setReorderLevel("Error fetching data");
        });
    }
  }, [prodId]);

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
      status={item.QUANTITY_ON_HAND > 0 ? "Available" : "Out of Stock"}
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
          <DetailLabel>Expiry Date:</DetailLabel>{" "}
          {new Date(item.EXPIRY_DATE).toLocaleDateString()}
        </Detail>
        <Detail>
          <DetailLabel>Inbound Delivery Id:</DetailLabel>{" "}
          {item.INBOUND_DEL_ID}
        </Detail>
        <Detail>
          <DetailLabel>Quantity on Hand:</DetailLabel> {item.QUANTITY_ON_HAND}
        </Detail>
        <Detail>
          <DetailLabel>PRODUCT ID:</DetailLabel> {item.PRODUCT_ID}
        </Detail>
        <Detail>
          <DetailLabel>Reorder Level:</DetailLabel>{" "}
          {reorderLevel !== null ? reorderLevel : "Loading..."}
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
