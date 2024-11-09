import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../Layout/Modal"; // Import the reusable Modal component
import productData from "../../data/ProductData";
import Button from "../Layout/Button";
import PRICE_HISTORY_DATA from "../../data/PriceHistoryData"; // Import Price History Data
import PriceHistoryDetails from "./PriceHistory/PriceHistoryDetails"; // Import PriceHistoryDetails component
import { USER } from '../../data/UserData'; // Import User Data

const ProductDetailsModal = ({ productId, onClose }) => {
  const product = productData.PRODUCT.find((p) => p.PROD_ID === productId);
  const productDetail = productData.PRODUCT_DETAILS.find(
    (d) => d.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
  );
  const category = productData.PRODUCT_CATEGORY.find(
    (c) => c.PROD_CAT_CODE === product.PROD_CAT_CODE
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false); // State for Price History Modal

  if (!product || !productDetail || !category) {
    return null; // Or show a loading spinner/error message
  }

  const handleEdit = () => setIsEditing(true);


  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this product?"
    );
    if (confirmRemoval) {
      // Implement remove logic here
      alert(`Product ${product.PROD_NAME} removed`);
      onClose(); // Close the modal after removal
    }
  };

  const handleMoreInfoClick = () => {
    setShowPriceHistory(true); // Open the price history modal
  };

  const closePriceHistoryModal = () => {
    setShowPriceHistory(false); // Close the price history modal
  };

  // Filter the price history for the current product
  const priceHistoryEntries = PRICE_HISTORY_DATA.filter(
    (entry) => entry.PROD_ID === productId
  );

  // Create user mapping from USER data
  const userMapping = Object.fromEntries(
    USER.map((user) => [
      user.USER_ID,
      `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`
    ])
  );

  return (
    <Modal
      title={
        isEditing ? `Edit ${product.PROD_NAME}` : `${product.PROD_NAME} Details`
      }
      onClose={onClose}
    >
      {isEditing ? (
        <Details>
          {/* Existing editing fields go here */}
        </Details>
      ) : (
        <>
          <Section>
            <Image src={product.PROD_IMAGE} alt={product.PROD_NAME} />
            <Detail>
              <DetailLabel>Name:</DetailLabel> {product.PROD_NAME}
            </Detail>
            <Detail>
              <DetailLabel>Category:</DetailLabel> {category.PROD_CAT_NAME}
            </Detail>
            <Detail>
              <DetailLabel>Size:</DetailLabel> {productDetail.PROD_DETAILS_SIZE}
            </Detail>
            <Detail>
              <DetailLabel>Brand:</DetailLabel>{" "}
              {productDetail.PROD_DETAILS_BRAND}
            </Detail>
            <Detail>
              <DetailLabel>Price:</DetailLabel> ₱
              {productDetail.PROD_DETALS_PRICE}
              <MoreInfoButton onClick={handleMoreInfoClick}>
                More Info
              </MoreInfoButton>
            </Detail>
            <Detail>
              <DetailLabel>Description:</DetailLabel>{" "}
              {productDetail.PROD_DETAILS_DESCRIPTION}
            </Detail>
            <Detail>
              <DetailLabel>Reorder Level:</DetailLabel> {product.PROD_RO_LEVEL}
            </Detail>
            <Detail>
              <DetailLabel>Reorder Quantity:</DetailLabel> {product.PROD_RO_QTY}
            </Detail>
            <Detail>
              <DetailLabel>Quantity on Hand:</DetailLabel> {product.PROD_QOH}
            </Detail>
            <Detail>
              <DetailLabel>Date Created:</DetailLabel>{" "}
              {product.PROD_DATECREATED}
            </Detail>
            <Detail>
              <DetailLabel>Date Updated:</DetailLabel>{" "}
              {product.PROD_DATEUPDATED}
            </Detail>
          </Section>

          <ButtonGroup>
            <Button variant="red" onClick={handleRemove}>
              Remove
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Edit Details
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <Modal onClose={closePriceHistoryModal} title={`${product.PROD_NAME} Price History`}>
          <PriceHistoryDetails priceHistory={priceHistoryEntries} userMapping={userMapping} />
        </Modal>
      )}
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

const Details = styled.div`
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
  gap: 10px;
  justify-content: flex-end;
`;

const MoreInfoButton = styled(Button)`
  margin-left: 10px; /* Space between price and button */
`;

export default ProductDetailsModal;
