import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";
import Button from "../Layout/Button";
import productData from "../../data/ProductData"; // Adjust the import path as necessary

const AddProductModal = ({ onClose, onSave }) => {
  const [productName, setProductName] = useState("");
  const [detailsCode, setDetailsCode] = useState("");
  const [roLevel, setRoLevel] = useState("");
  const [roQty, setRoQty] = useState("");
  const [qoh, setQoh] = useState("");
  const [category, setCategory] = useState("No Category"); // Default category
  const [categoryCode, setCategoryCode] = useState(""); // Keep the code separate for saving
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!productName) newErrors.productName = "This field is required.";
    if (!detailsCode) newErrors.detailsCode = "This field is required.";
    if (!roLevel || isNaN(roLevel) || roLevel < 1)
      newErrors.roLevel = "This field is required.";
    if (!roQty || isNaN(roQty) || roQty < 0)
      newErrors.roQty = "This field is required.";
    if (!qoh || isNaN(qoh) || qoh < 0)
      newErrors.qoh = "This field is required.";
    if (!description) newErrors.description = "This field is required.";
    if (!price || isNaN(price) || price <= 0)
      newErrors.price = "This field is required.";
    if (!brand) newErrors.brand = "This field is required.";
    if (!size) newErrors.size = "This field is required.";
    if (!measurement) newErrors.measurement = "This field is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newProduct = {
      PROD_ID: `P00${Math.floor(Math.random() * 1000)}`, // Example ID, should be unique
      PROD_NAME: productName,
      PROD_DETAILS_CODE: detailsCode,
      PROD_RO_LEVEL: parseInt(roLevel),
      PROD_RO_QTY: parseInt(roQty),
      PROD_QOH: parseInt(qoh),
      PROD_IMG: image, // Store the image URL
      PROD_DATECREATED:
        productData.PROD_DATECREATED || new Date().toISOString().split("T")[0],
      PROD_DATEUPDATED:
        productData.PROD_DATEUPDATED || new Date().toISOString().split("T")[0],
      PROD_CAT_CODE: categoryCode || "C000", // Default code if none is selected
    };

    const newProductDetails = {
      PROD_DETAILS_CODE: detailsCode,
      PROD_DETAILS_DESCRIPTION: description,
      PROD_DETAILS_PRICE: parseFloat(price),
      PROD_DETAILS_BRAND: brand,
      PROD_DETAILS_SIZE: size,
      PROD_DETAILS_MEASUREMENT: measurement,
      PROD_CAT_CODE: categoryCode || "C000", // Default code if none is selected
    };

    onSave(newProduct, newProductDetails);
    onClose();
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const categoryData = productData.PRODUCT_CATEGORY.find(
      (cat) => cat.PROD_CAT_NAME === selectedCategory
    );
    if (categoryData) {
      setCategory(selectedCategory);
      setCategoryCode(categoryData.PROD_CAT_CODE); // Set the category code from selected category
    } else {
      setCategory("No Category");
      setCategoryCode(""); // Reset code if "No Category" is selected
    }
  };

  return (
    <ModalOverlay>
      <ModalContent ref={modalRef}>
        <ModalHeader>
          <h2>Add Product</h2>
          <CloseButton onClick={onClose}>
            <IoCloseCircle />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <ImageUpload>
            {image ? <ImagePreview src={image} alt="Product Preview" /> : null}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </ImageUpload>
          <Field>
            <Label>Product Name</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
            {errors.productName && <ErrorText>{errors.productName}</ErrorText>}
          </Field>
          <Field>
            <Label>Details Code</Label>
            <Input
              value={detailsCode}
              onChange={(e) => setDetailsCode(e.target.value)}
              placeholder="Enter details code"
            />
            {errors.detailsCode && <ErrorText>{errors.detailsCode}</ErrorText>}
          </Field>
          <Field>
            <Label>RO Level</Label>
            <Input
              type="number"
              value={roLevel}
              onChange={(e) => setRoLevel(e.target.value)}
              placeholder="Enter RO level"
              min="1"
            />
            {errors.roLevel && <ErrorText>{errors.roLevel}</ErrorText>}
          </Field>
          <Field>
            <Label>RO Qty</Label>
            <Input
              type="number"
              value={roQty}
              onChange={(e) => setRoQty(e.target.value)}
              placeholder="Enter RO quantity"
            />
            {errors.roQty && <ErrorText>{errors.roQty}</ErrorText>}
          </Field>
          <Field>
            <Label>Quantity on Hand (QOH)</Label>
            <Input
              type="number"
              value={qoh}
              onChange={(e) => setQoh(e.target.value)}
              placeholder="Enter quantity on hand"
            />
            {errors.qoh && <ErrorText>{errors.qoh}</ErrorText>}
          </Field>
          <Field>
            <Label>Category</Label>
            <Select value={category} onChange={handleCategoryChange}>
              <option value="No Category">No Category</option>
              {productData.PRODUCT_CATEGORY.map((cat) => (
                <option key={cat.PROD_CAT_CODE} value={cat.PROD_CAT_NAME}>
                  {cat.PROD_CAT_NAME}
                </option>
              ))}
            </Select>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}
          </Field>
          <Field>
            <Label>Description</Label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
            {errors.description && <ErrorText>{errors.description}</ErrorText>}
          </Field>
          <Field>
            <Label>Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter product price"
              min="0.01"
              step="0.01"
            />
            {errors.price && <ErrorText>{errors.price}</ErrorText>}
          </Field>
          <Field>
            <Label>Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand"
            />
            {errors.brand && <ErrorText>{errors.brand}</ErrorText>}
          </Field>
          <Field>
            <Label>Size</Label>
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Select Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </Select>
            {errors.size && <ErrorText>{errors.size}</ErrorText>}
          </Field>
          <Field>
            <Label>Measurement</Label>
            <Select
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value)}
            >
              <option value="">Select Measurement</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="inches">Inches (in)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="liter">Liters (L)</option>
            </Select>
            {errors.measurement && <ErrorText>{errors.measurement}</ErrorText>}
          </Field>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="red" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Add Product
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ErrorText = styled.span`
  color: red;
  font-size: 0.75rem;
  margin-top: 3px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.red};
`;

const ModalBody = styled.div``;

const ImageUpload = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 15px;
`;

const ImagePreview = styled.img`
  width: 100px; /* Adjust width as needed */
  height: 100px; /* Adjust height as needed */
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const Field = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export default AddProductModal;
