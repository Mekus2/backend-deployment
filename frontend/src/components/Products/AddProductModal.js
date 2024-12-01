import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { FaTimes } from "react-icons/fa";
import Button from "../Layout/Button";

const AddProductModal = ({ onClose, onSave }) => {
  const [productName, setProductName] = useState("");
  const [roLevel, setRoLevel] = useState("");
  const [roQty, setRoQty] = useState("");
  const [qoh, setQoh] = useState("");
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [size, setSize] = useState("");
  const [measurement] = useState("");
  // const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [purchasePrice, setPurchasePrice] = useState(""); // Add this line

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

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImage(URL.createObjectURL(file));
  //   }
  // };

  const validate = () => {
    const newErrors = {};
    if (!productName) newErrors.productName = "This field is required.";
    if (!roLevel || isNaN(roLevel) || roLevel < 1)
      newErrors.roLevel = "RO Level must be a positive number.";
    if (!roQty || isNaN(roQty) || roQty <= 0)
      // Disallow 0 or negative
      newErrors.roQty = "RO Quantity must be a positive number.";
    if (!qoh || isNaN(qoh) || qoh < 0)
      // Allow zero for QOH, but no negative values
      newErrors.qoh = "Quantity on Hand (QOH) cannot be negative.";
    if (!description) newErrors.description = "This field is required.";
    if (!price || isNaN(price) || price <= 0)
      // Ensure price is a positive number
      newErrors.price = "This field is required and must be positive.";
    if (!purchasePrice || isNaN(purchasePrice) || purchasePrice <= 0)
      newErrors.purchasePrice =
        "Purchase price must be a valid number greater than 0.";
    if (!supplier) newErrors.supplier = "This field is required.";
    if (!size) newErrors.size = "This field is required.";
    if (!measurement) newErrors.measurement = "This field is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberInput = (e, setter) => {
    const value = e.target.value;
  
    // Allow empty input to clear the field
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };
  
  

  // Handle tag input and adding tags to the list
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      const newTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag && !tags.includes(tag)); // Filter out empty or duplicate tags
      setTags((prevTags) => [...prevTags, ...newTags]); // Update with previous tags
      e.target.value = ""; // Clear input after processing
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  // Modify handleSave function to include purchasePrice
  const handleSave = () => {
    if (!validate()) return;

    const newProduct = {
      PROD_ID: `P00${Math.floor(Math.random() * 1000)}`, // Example ID, should be unique
      PROD_NAME: productName,
      PROD_RO_LEVEL: parseInt(roLevel),
      PROD_RO_QTY: parseInt(roQty),
      PROD_QOH: parseInt(qoh),
      // PROD_IMG: image || "https://via.placeholder.com/50", // Use default image if none uploaded
      PROD_DATECREATED: new Date().toISOString().split("T")[0],
      PROD_DATEUPDATED: new Date().toISOString().split("T")[0],
      PROD_TAGS: tags, // Save the tags instead of category
    };

    const newProductDetails = {
      PROD_DETAILS_PURCHASE_PRICE: parseFloat(purchasePrice), // Save purchase price
      PROD_DETAILS_PRICE: parseFloat(price),
      PROD_DETAILS_DESCRIPTION: description,
      PROD_DETAILS_SUPPLIER: supplier,
      PROD_DETAILS_UNITS: size,
      PROD_DETAILS_MEASUREMENT: measurement,
      PROD_TAGS: tags, // Save the tags instead of category
    };

    onSave(newProduct, newProductDetails);
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent ref={modalRef}>
        <ModalHeader>
          <h2>Add Product</h2>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {/* <ImageUpload>
            {image ? <ImagePreview src={image} alt="Product Preview" /> : null}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </ImageUpload> */}
          <Field>
            <Label>Product Name</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
            {errors.productName && <ErrorText>{errors.productName}</ErrorText>}
          </Field>
          <Field style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <Label>Price Details</Label>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => handleNumberInput(e, setPurchasePrice)}
                placeholder="Enter purchase price"
                min="0.01"
                step="0.01"
              />
              {errors.purchasePrice && (
                <ErrorText>{errors.purchasePrice}</ErrorText>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Label>&nbsp;</Label> {/* Empty label to maintain alignment */}
              <Input
                type="number"
                value={price}
                onChange={(e) => handleNumberInput(e, setPrice)}
                placeholder="Enter product price"
              />
              {errors.price && <ErrorText>{errors.price}</ErrorText>}
            </div>
          </Field>

          <Field style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <Label>Reorder Details</Label>
              <Input
                type="number"
                value={roLevel}
                onChange={(e) => setRoLevel(e.target.value)}
                placeholder="Enter RO level"
                min="1"
              />
              {errors.roLevel && <ErrorText>{errors.roLevel}</ErrorText>}
            </div>
            <div style={{ flex: 1 }}>
              <Label>&nbsp;</Label> {/* Empty label to maintain alignment */}
              <Input
                type="number"
                value={roQty}
                onChange={(e) => handleNumberInput(e, setRoQty)}
                placeholder="Enter RO quantity"
              />
              {errors.roQty && <ErrorText>{errors.roQty}</ErrorText>}
            </div>
          </Field>

          <Field>
            <Label>Quantity on Hand (QOH)</Label>
            <Input
              type="number"
              value={qoh}
              onChange={(e) => handleNumberInput(e, setQoh)}
              placeholder="Enter quantity on hand"
            />
            {errors.qoh && <ErrorText>{errors.qoh}</ErrorText>}
          </Field>
          <Field>
            <Label>Tags</Label>
            <div>
              <Input
                type="text"
                onChange={handleTagInputChange}
                placeholder="Enter tags, separated by commas"
              />
              <TagList>
                {tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <CloseIcon onClick={() => handleRemoveTag(tag)} />
                  </Tag>
                ))}
              </TagList>
            </div>
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
            <Label>Supplier</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Enter supplier"
            />
            {errors.supplier && <ErrorText>{errors.supplier}</ErrorText>}
          </Field>
          <Field>
            <Label>Units</Label>
            <Input
              list="units-list" // Link the input field to the datalist
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter or select unit"
            />
            <datalist id="units-list">
              <option value="unit" />
              <option value="pack" />
              <option value="box" />
              <option value="bundle" />
              <option value="case" />
              <option value="carton" />
              <option value="bottle" />
              <option value="can" />
              <option value="kg" />
              <option value="g" />
              <option value="liter" />
              <option value="ml" />
              <option value="meter" />
              <option value="dozen" />
              <option value="roll" />
              <option value="sheet" />
              <option value="tile" />
            </datalist>

            {errors.size && <ErrorText>{errors.size}</ErrorText>}
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
const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Tag = styled.span`
  background-color: ${colors.primary}; /* Replace with desired color */
  color: white;
  padding: 5px 10px;
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

// const ImageUpload = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
//   margin-bottom: 15px;
// `;

// const ImagePreview = styled.img`
//   width: 100px;
//   height: 100px;
//   object-fit: cover;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   margin-bottom: 10px;
//   display: block;
//   margin-left: auto;
//   margin-right: auto; /* Center horizontally */
// `;

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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export default AddProductModal;
