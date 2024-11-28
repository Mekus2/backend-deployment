import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";
import { colors } from "../../colors";
import { FaTimes } from "react-icons/fa";
import { notify } from "../Layout/CustomToast";

const ProductDetailsModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({ tags: [] });
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
          tags: response.data.PROD_TAGS || [],
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (!product) return <p>Loading...</p>;

  const handleEdit = () => setIsEditing(true);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a preview URL for the image
      setEditFields((prev) => ({ ...prev, PROD_IMG: imageUrl }));
    }
  };
  const handleInputChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (newTags) => {
    setEditFields((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSave = async () => {
    try {
      const updatedProduct = {
        ...product,
        PROD_NAME: editFields.PROD_NAME,
        PROD_IMG: editFields.PROD_IMG,
        PROD_DETAILS: { ...editFields },
        PROD_RO_LEVEL: editFields.PROD_RO_LEVEL,
        PROD_RO_QTY: editFields.PROD_RO_QTY,
        PROD_QOH: editFields.PROD_QOH,
        PROD_TAGS: editFields.tags, // Save tags
      };
      await axios.put(
        `http://127.0.0.1:8000/items/productList/${productId}/`,
        updatedProduct
      );
      notify.success("Product updated successfully!");
      await logProductCreation(product, updatedProduct);
      setProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product data:", error);
    }
  };

  const logProductCreation = async (oldProduct, updatedProduct) => {
    const userId = localStorage.getItem("user_id");
    const userResponse = await fetch(
      `http://127.0.0.1:8000/account/logs/${userId}/`
    );
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error("Failed to fetch user details:", errorData);
      return;
    }
    const userData = await userResponse.json();
    const username = userData.username; // Assuming the API response includes a `username` field

    const changes = [];
    const fieldsToCheck =[
      { field: "PROD_NAME", label: "Product Name" },
      { field: "PROD_RO_LEVEL", label: "Reorder Level" },
      { field: "PROD_RO_QTY", label: "Reorder Quantity" },
      { field: "PROD_QOH", label: "Quantity on Hand" },
      { field: "PROD_TAGS", label: "Tags" },
      { field: "PROD_DETAILS_DESCRIPTION", label: "Description" },
      { field: "PROD_DETAILS_PRICE", label: "Price" },
      { field: "PROD_DETAILS_SUPPLIER", label: "Supplier" },
      { field: "PROD_DETAILS_UNITS", label: "Units" },
    ];
      // Check for changes and format them for logging
      fieldsToCheck.forEach(({ field, label }) => {
        if (oldProduct[field] !== updatedProduct[field]) {
            changes.push(
                `${label} changed from "${oldProduct[field] || "N/A"}" to "${
                    updatedProduct[field] || "N/A"
                }"`
            );
        }
    });
    
    // If there are changes, prepare the log payload
    if (changes.length > 0) {
      const logPayload = {
          LLOG_TYPE: "User logs",
          LOG_DESCRIPTION: `${username} updated the Product details:${changes.join("\n")}`,
          USER_ID: userId,
      };

      try {
        
          // Send the log data to the backend
          const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(logPayload),
          });

          // Handle the response
          if (response.ok) {
              console.log("Product updated details:", logPayload);
          } else {
              const errorData = await response.json();
              console.error("Failed to create log:", errorData);
          }
      } catch (error) {
          console.error("Error logging product updates:", error);
      }
  } else {
      console.log("No changes detected. Logging skipped.");
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
      title={
        isEditing ? `Edit ${product.PROD_NAME}` : `${product.PROD_NAME} Details`
      }
      onClose={onClose}
    >
      {isEditing ? (
        <Details>
          <DetailItem>
            <Label>Image:</Label>
            {editFields.PROD_IMG && (
              <ImagePreview src={editFields.PROD_IMG} alt="Preview" />
            )}
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </DetailItem>
          <DetailItem>
            <Label>Name:</Label>
            <Input
              value={editFields.PROD_NAME || ""}
              onChange={(e) => handleInputChange("PROD_NAME", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Tags:</Label>
            <TagsInput value={editFields.tags} onChange={handleTagsChange} />
          </DetailItem>
          <DetailItem>
            <Label>Units:</Label>
            <Input
              value={editFields.PROD_DETAILS_UNITS || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_UNITS", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Brand:</Label>
            <Input
              value={editFields.PROD_DETAILS_SUPPLIER || ""}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_SUPPLIER", e.target.value)
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
              onChange={(e) =>
                handleInputChange("PROD_RO_LEVEL", e.target.value)
              }
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
            <DetailLabel>Image:</DetailLabel>
            {product.PROD_IMG && (
              <ImagePreview src={product.PROD_IMG} alt="Product Image" />
            )}
          </Detail>
          <Detail>
            <DetailLabel>Name:</DetailLabel> {product.PROD_NAME}
          </Detail>
          <Detail>
            <DetailLabel>Tags:</DetailLabel>{" "}
            {product.PROD_TAGS && product.PROD_TAGS.join(", ")}
          </Detail>
          <Detail>
            <DetailLabel>Units:</DetailLabel> {productDetail.PROD_DETAILS_UNITS}
          </Detail>
          <Detail>
            <DetailLabel>Brand:</DetailLabel>{" "}
            {productDetail.PROD_DETAILS_SUPPLIER}
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

const TagsInput = ({ value, onChange }) => {
  const [newTag, setNewTag] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && newTag.trim()) {
      e.preventDefault();
      const updatedTags = [...value, newTag.trim()];
      onChange(updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = value.filter((tag) => tag !== tagToRemove);
    onChange(updatedTags);
  };

  const handleBlur = () => {
    if (newTag.trim()) {
      const updatedTags = [...value, newTag.trim()];
      onChange(updatedTags);
      setNewTag("");
    }
  };

  return (
    <>
      <TagInput
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Add a tag"
      />
      <TagList>
        {value.map((tag, index) => (
          <Tag key={index}>
            {tag}
            <CloseIcon onClick={() => handleRemoveTag(tag)} />
          </Tag>
        ))}
      </TagList>
    </>
  );
};

// Styled Components
const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Tag = styled.span`
  background-color: ${colors.primary}; /* Primary color */
  color: white; /* White text */
  padding: 6px 12px;
  border-radius: 15px;
  margin: 5px;
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: bold;
`;

const CloseIcon = styled(FaTimes)`
  margin-left: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: ${colors.red};
  &:hover {
    color: ${colors.darkRed};
  }
`;

const TagInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.875rem;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;
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
