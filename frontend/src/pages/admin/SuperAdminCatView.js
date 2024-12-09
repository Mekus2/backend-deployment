import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import productData from "../../data/ProductData";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Button from "../../components/Layout/Button";
import AddProductModal from "../../components/Products/AddProductModal"; // Import the AddProductModal component
import ProductDetailsModal from "../../components/Products/ProductDetailsModal"; // Import the ProductDetailsModal component
import { FaPlus } from "react-icons/fa"; // Import FaPlus icon
import { colors } from "../../colors";

const SuperAdminCatViewPage = () => {
  const { categoryId } = useParams(); // Get category ID from URL parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] =
    useState(false);

  // Filter products based on category and search term
  const filteredProducts = productData.products.filter((product) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const productDetail = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
    );
    const category = productData.PRODUCT_CATEGORY.find(
      (cat) => cat.PROD_CAT_CODE === product.PROD_CAT_CODE
    );

    return (
      category.PROD_CAT_CODE === categoryId && // Check if product is in the selected category
      (product.PROD_NAME.toLowerCase().includes(lowerCaseSearchTerm) ||
        productDetail?.PROD_DETAILS_SUPPLIER?.toLowerCase().includes(
          lowerCaseSearchTerm
        ))
    );
  });

  const headers = ["Image", "Product", "Brand", "Price", "Action"];

  const rows = filteredProducts.map((product) => {
    const productDetail = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
    );

    return [
      <img
        src={product.PROD_IMAGE} // Use PROD_IMAGE here
        alt={product.PROD_NAME}
        style={{ width: "50px", height: "auto" }}
      />,
      product.PROD_NAME,
      productDetail?.PROD_DETAILS_SUPPLIER,
      `₱${productDetail?.PROD_DETALS_PRICE}`,
      <ActionButton
        key="action"
        fontSize="14px"
        onClick={() => openProductDetailsModal(product.PROD_ID)}
      >
        Details
      </ActionButton>,
    ];
  });

  // Handle modal open/close
  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);
  const openProductDetailsModal = (productId) => {
    setSelectedProductId(productId);
    setIsProductDetailsModalOpen(true);
  };
  const closeProductDetailsModal = () => {
    setSelectedProductId(null);
    setIsProductDetailsModalOpen(false);
  };

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <StyledButton onClick={openAddProductModal}>
          <FaPlus className="icon" /> Add Product
        </StyledButton>
      </Controls>
      <Table headers={headers} rows={rows} />
      {isAddProductModalOpen && (
        <AddProductModal
          onClose={closeAddProductModal}
          // onSave={handleSaveProduct} // Handle saving the product
        />
      )}
      {isProductDetailsModalOpen && selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          onClose={closeProductDetailsModal}
        />
      )}
    </>
  );
};

// Styled components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const ActionButton = styled(Button)`
  background-color: ${colors.primary};
  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

export default SuperAdminCatViewPage;
