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
import AddSubcategoryModal from "./AddSubcategoryModal";
import SubcategoryDetailsModal from "./SubCategory/SubcategoryDetailsModal";
import Card from "../../Layout/Card";

const CategoryDetailsModal = ({ category = {}, products = [], onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState(category);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAddProductMode, setIsAddProductMode] = useState(false);
  const [isAddSubcategoryMode, setIsAddSubcategoryMode] = useState(false);
  const [isSubcategoryDetailsModalOpen, setIsSubcategoryDetailsModalOpen] =
    useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const filteredProducts = products
    .filter((product) => product.PROD_CAT_CODE === category.PROD_CAT_CODE)
    .filter((product) => {
      const productName = product.PROD_NAME?.toLowerCase() || ""; // Null-safety check for PROD_NAME
      const productQuantity = product.PROD_QOH?.toString() || ""; // Null-safety check for PROD_QOH
      return (
        productName.includes(searchTerm.toLowerCase()) ||
        productQuantity.includes(searchTerm)
      );
    });

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

  const countProductsInSubcategory = (subcategoryId) => {
    const subcategory = categoryDetails.PROD_CAT_SUBCATEGORY.find(
      (subcat) => subcat.PROD_SUBCAT_ID === subcategoryId
    );
    return subcategory ? subcategory.PRODUCT.length : 0;
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryDetailsModalOpen(true);
  };

  const productHeaders = ["Product Name", "Quantity on Hand", "Actions"];
  const productRows =
    filteredProducts.length > 0
      ? filteredProducts.map((product) => [
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
          </ActionCell>,
        ])
      : [
          [
            <NoProductsCell colSpan={3}>No products found in this category.</NoProductsCell>,
          ],
        ];

  return (
    <Modal
      title={`Category: ${categoryDetails.PROD_CAT_NAME}`}
      onClose={onClose}
    >
      <SearchBarContainer>
        <SearchBar
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <AddProductButton
            variant="primary"
            onClick={() => setIsAddProductMode(true)}
          >
            <FaPlus style={{ marginRight: "5px" }} /> Product
          </AddProductButton>
          <AddSubcategoryButton
            variant="primary"
            onClick={() => setIsAddSubcategoryMode(true)}
          >
            <FaPlus style={{ marginRight: "5px" }} /> Subcategory
          </AddSubcategoryButton>
        </ButtonGroup>
      </SearchBarContainer>

      {/* Conditionally render Subcategories label and content */}
      {categoryDetails.PROD_CAT_SUBCATEGORY && categoryDetails.PROD_CAT_SUBCATEGORY.length > 0 && (
        <>
          <SectionTitle>Subcategories</SectionTitle>
          <SubcategoryContainer>
            {categoryDetails.PROD_CAT_SUBCATEGORY.map((subcategory) => (
              <CardWrapper
                key={subcategory.PROD_SUBCAT_ID}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                <Card
                  label={subcategory.PROD_SUBCAT_NAME || "N/A"}
                  value={countProductsInSubcategory(subcategory.PROD_SUBCAT_ID)}
                  bgColor={colors.secondary}
                />
              </CardWrapper>
            ))}
          </SubcategoryContainer>
        </>
      )}

      <SectionTitle>Products</SectionTitle>
      <Table headers={productHeaders} rows={productRows} />

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

      {isSubcategoryDetailsModalOpen && selectedSubcategory && (
        <SubcategoryDetailsModal
          subcategory={selectedSubcategory}
          products={selectedSubcategory.PRODUCT || []}
          onClose={() => setIsSubcategoryDetailsModalOpen(false)}
        />
      )}
    </Modal>
  );
};

// Styled Components
const SearchBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

const SubcategoryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
`;

const CardWrapper = styled.div`
  cursor: pointer;
  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
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

const SectionTitle = styled.h3`
  margin-bottom: 10px;
  color: ${colors.dark};
  font-weight: bold;
`;

export default CategoryDetailsModal;
