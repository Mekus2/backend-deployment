import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import SearchBar from "../../Layout/SearchBar";
import EditCategoryModal from "./EditCategoryModal";
import ProductDetailsModal from "../ProductDetailsModal";
import CategoryAddProduct from "./CategoryAddProduct";
import { FaPlus } from "react-icons/fa";
import Button from "../../Layout/Button";
import Table from "../../Layout/Table";
import AddSubcategoryModal from "./AddSubcategoryModal"; // Import the AddSubcategoryModal

const CategoryDetailsModal = ({ category = {}, products = [], onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState(category);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAddProductMode, setIsAddProductMode] = useState(false);
  const [isAddSubcategoryMode, setIsAddSubcategoryMode] = useState(false); // New state for Add Subcategory modal

  const filteredProducts = products
    .filter((product) => product.PROD_CAT_CODE === category.PROD_CAT_CODE)
    .filter((product) => 
      product.PROD_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.PROD_QOH.toString().includes(searchTerm)
    );

  const handleSaveCategory = (updatedCategory) => {
    setCategoryDetails(updatedCategory);
    setIsEditMode(false);
  };

  const handleShowDetails = (productId) => {
    setSelectedProductId(productId);
  };

  const handleAddProduct = (product) => {
    console.log("Adding product to category:", product);
    setIsAddProductMode(false);
  };

  const handleAddSubcategory = (subcategory) => {
    console.log("Adding subcategory:", subcategory);
    setIsAddSubcategoryMode(false);
  };

  const handleRemoveProduct = (productId) => {
    console.log("Removing product:", productId);
  };

  const headers = ["Product Name", "Quantity on Hand", "Actions"];
  const rows = filteredProducts.length > 0 ? filteredProducts.map((product) => (
    [
      product.PROD_NAME || "N/A",
      product.PROD_QOH || 0,
      <ActionCell key="actions">
        <Button
          variant="primary"
          onClick={() => handleShowDetails(product.PROD_ID)}
        >
          Details
        </Button>
        <Button
          backgroundColor={colors.red}
          hoverColor={colors.redHover}
          onClick={() => handleRemoveProduct(product.PROD_ID)}
          style={{ marginLeft: "10px" }}
        >
          Remove
        </Button>
      </ActionCell>
    ]
  )) : [[<NoProductsCell colSpan={3}>No products found.</NoProductsCell>]];

  return (
    <Modal title={`Category: ${categoryDetails.PROD_CAT_NAME}`} onClose={onClose}>
      <SearchBarContainer>
        <SearchBar
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <AddProductButton variant="primary" onClick={() => setIsAddProductMode(true)}>
            <FaPlus style={{ marginRight: '5px' }} /> Product
          </AddProductButton>
          <AddSubcategoryButton variant="primary" onClick={() => setIsAddSubcategoryMode(true)}>
            <FaPlus style={{ marginRight: '5px' }} /> Subcategory
          </AddSubcategoryButton>
        </ButtonGroup>
      </SearchBarContainer>

      <Table headers={headers} rows={rows} />

      <ButtonGroup>
        <Button variant="primary" onClick={() => setIsEditMode(true)}>
          Edit Category
        </Button>
      </ButtonGroup>

      {isEditMode && (
        <EditCategoryModal
          categoryDetails={categoryDetails}
          onSave={handleSaveCategory}
          onClose={() => setIsEditMode(false)}
        />
      )}

      {isAddProductMode && (
        <CategoryAddProduct
          availableProducts={products}
          onAddProduct={handleAddProduct}
          onClose={() => setIsAddProductMode(false)}
        />
      )}

      {selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {isAddSubcategoryMode && (
        <AddSubcategoryModal
          category={categoryDetails}
          onSave={handleAddSubcategory}
          onClose={() => setIsAddSubcategoryMode(false)}
        />
      )}
    </Modal>
  );
};

// Styled components
const SearchBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* Ensure there is a small gap between the buttons */
`;

const AddProductButton = styled(Button)`
  display: flex;
  align-items: center;
`;

const AddSubcategoryButton = styled(Button)`
  display: flex;
  align-items: center;
  background-color: ${colors.primary};
  color: white;
`;

const ActionCell = styled.td`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoProductsCell = styled.td`
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

export default CategoryDetailsModal;
