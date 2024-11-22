import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";

const ProductDetailsModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/items/productList/${productId}/`
        );
        setProduct(response.data);
        setEditFields({
          ...response.data.PROD_DETAILS,
          PROD_NAME: response.data.PROD_NAME,
          PROD_RO_LEVEL: response.data.PROD_RO_LEVEL || "",
          PROD_RO_QTY: response.data.PROD_RO_QTY || "",
          PROD_QOH: response.data.PROD_QOH || "",
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (!product) return <p>Loading...</p>;

  const handleEdit = () => setIsEditing(true);

  const handleInputChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedProduct = {
        ...product,
        PROD_NAME: editFields.PROD_NAME,
        PROD_DETAILS: { ...editFields },
        PROD_RO_LEVEL: editFields.PROD_RO_LEVEL,
        PROD_RO_QTY: editFields.PROD_RO_QTY,
        PROD_QOH: editFields.PROD_QOH,
      };
      await axios.put(
        `http://127.0.0.1:8000/items/productList/${productId}/`,
        updatedProduct
      );
      setProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product data:", error);
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      `Are you sure you want to remove this product?`
    );
    if (confirmRemoval) {
      alert(`Product ${product.PROD_NAME} removed`);
      onClose();
    }
  };

  const handleMoreInfoClick = () => setShowPriceHistory(true);

  const productDetail = product.PROD_DETAILS;

  return (
    <Modal
      title={isEditing ? `Edit ${product.PROD_NAME}` : `${product.PROD_NAME} Details`}
      onClose={onClose}
    >
      {isEditing ? (
        <Details>
          <DetailItem>
            <Label>Name:</Label>
            <Input
              value={editFields.PROD_NAME || ""}
              onChange={(e) => handleInputChange("PROD_NAME", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Category:</Label>
            <Input
              value={editFields.PROD_CAT_CODE || ""}
              onChange={(e) => handleInputChange("PROD_CAT_CODE", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Size:</Label>
            <Input
              value={editFields.PROD_DETAILS_SIZE || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_SIZE", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Brand:</Label>
            <Input
              value={editFields.PROD_DETAILS_BRAND || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_BRAND", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Price:</Label>
            <Input
              type="number"
              value={editFields.PROD_DETAILS_PRICE || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_PRICE", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Description:</Label>
            <TextArea
              value={editFields.PROD_DETAILS_DESCRIPTION || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_DESCRIPTION", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Reorder Level:</Label>
            <Input
              type="number"
              value={editFields.PROD_RO_LEVEL || ""}
              onChange={(e) => handleInputChange("PROD_RO_LEVEL", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Reorder Quantity:</Label>
            <Input
              type="number"
              value={editFields.PROD_RO_QTY || ""}
              onChange={(e) => handleInputChange("PROD_RO_QTY", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Quantity on Hand:</Label>
            <Input
              type="number"
              value={editFields.PROD_QOH || ""}
              onChange={(e) => handleInputChange("PROD_QOH", e.target.value)}
            />
          </DetailItem>
        </Details>
      ) : (
        <Details>
          <Detail>
            <DetailLabel>Name:</DetailLabel> {product.PROD_NAME}
          </Detail>
          <Detail>
            <DetailLabel>Category:</DetailLabel> {product.PROD_CAT_CODE}
          </Detail>
          <Detail>
            <DetailLabel>Size:</DetailLabel> {productDetail.PROD_DETAILS_SIZE}
          </Detail>
          <Detail>
            <DetailLabel>Brand:</DetailLabel> {productDetail.PROD_DETAILS_BRAND}
          </Detail>
          <Detail>
            <DetailLabel>Price:</DetailLabel> ₱{productDetail.PROD_DETAILS_PRICE}
            <MoreInfoButton onClick={handleMoreInfoClick}>More Info</MoreInfoButton>
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
        </Details>
      )}
      <ButtonGroup>
        {isEditing ? (
          <>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="red" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="red" onClick={handleRemove}>
              Remove
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>
          </>
        )}
      </ButtonGroup>
    </Modal>
  );
};

// Styled Components
const Details = styled.div`
  margin-bottom: 20px;
`;

const Detail = styled.div`
  margin-bottom: 10px;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const MoreInfoButton = styled(Button)`
  margin-left: 10px;
`;

export default ProductDetailsModal;
