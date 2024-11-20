import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";
// import PriceHistoryDetails from "./PriceHistory/PriceHistoryDetails"; 
// import { USER } from '../../data/UserData'; // Import User Data


const ProductDetailsModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null); // Store the product data
  const [isEditing, setIsEditing] = useState(false);
  const [ setShowPriceHistory] = useState(false); // State for Price History Modal

  // Fetch product details when the component is mounted
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/items/productList/${productId}/`);
        setProduct(response.data); // Set the fetched product data
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductDetails();
  }, [productId]); // Run this effect only when productId changes

  if (!product) {
    return <p>Loading...</p>; // Show a loading message while the data is being fetched
  }

  // Extract product details and category data
  const productDetail = product.PROD_DETAILS;
  const category = product.PROD_CAT_CODE; // Assuming this is an ID or similar; adjust if needed

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

  // const closePriceHistoryModal = () => {
  //   setShowPriceHistory(false); // Close the price history modal
  // };

  // Filter the price history for the current product
  // const priceHistoryEntries = PRICE_HISTORY_DATA.filter(
  //   (entry) => entry.PROD_ID === productId
  // );

  // // Create user mapping from USER data
  // const userMapping = Object.fromEntries(
  //   USER.map((user) => [
  //     user.USER_ID,
  //     `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`
  //   ])
  // );

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
            <Image src={product.PROD_IMAGE || '/path/to/default/image.jpg'} alt={product.PROD_NAME} />
            <Detail>
              <DetailLabel>Name:</DetailLabel> {product.PROD_NAME}
            </Detail>
            <Detail>
              <DetailLabel>Category:</DetailLabel> {category}
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
              {productDetail.PROD_DETAILS_PRICE}
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
            {new Date(product.PROD_DATECREATED).toISOString().split("T")[0]}
            </Detail>
             <Detail>
            <DetailLabel>Date Updated:</DetailLabel>{" "}
            {new Date(product.PROD_DATEUPDATED).toISOString().split("T")[0]}
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
