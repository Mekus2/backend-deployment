import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import productData from "../../data/ProductData";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import CardTotalCategories from "../CardsData/CardTotalCategories";
import Button from "../Layout/Button";
import AddProductModal from "./AddProductModal";
import ProductDetailsModal from "./ProductDetailsModal"; // Import the ProductDetailsModal component
import { FaPlus } from "react-icons/fa"; // Import FaPlus icon
import { colors } from "../../colors";

const SharedProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] =
    useState(false);

  const navigate = useNavigate(); // Get the navigate function
  const location = useLocation(); // Get the current location (URL)

  // Filter products based on search term
  const filteredProducts = productData.PRODUCT.filter((product) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const productDetail = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
    );
    const category = productData.PRODUCT_CATEGORY.find(
      (cat) => cat.PROD_CAT_CODE === product.PROD_CAT_CODE
    )?.PROD_CAT_NAME;

    return (
      product.PROD_NAME.toLowerCase().includes(lowerCaseSearchTerm) || // Check product name
      category?.toLowerCase().includes(lowerCaseSearchTerm) ||       // Check category name
      productDetail?.PROD_DETAILS_BRAND?.toLowerCase().includes(lowerCaseSearchTerm) || // Check brand
      productDetail?.PROD_DETAILS_SIZE?.toLowerCase().includes(lowerCaseSearchTerm) ||  // Check unit/size
      productDetail?.PROD_DETALS_PRICE.toFixed(2).includes(lowerCaseSearchTerm) // Check price (formatted)
    );
  });

  const headers = [
    "Image",
    "Product",
    "Category",
    "Unit",
    "Brand",
    "Price",
    "Action",
  ];

  const rows = filteredProducts.map((product) => {
    const productDetail = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
    );
    const category = productData.PRODUCT_CATEGORY.find(
      (cat) => cat.PROD_CAT_CODE === product.PROD_CAT_CODE
    )?.PROD_CAT_NAME;

    return [
      <ImageWrapper>
        <img
          src={product.PROD_IMAGE} // Use PROD_IMAGE here
          alt={product.PROD_NAME}
          style={{ width: "50px", height: "auto" }}
        />
      </ImageWrapper>,
      product.PROD_NAME,
      category,
      productDetail?.PROD_DETAILS_SIZE,
      productDetail?.PROD_DETAILS_BRAND,
      `₱${productDetail?.PROD_DETALS_PRICE.toFixed(2)}`, // Fixed decimal price
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

  // Handle save actions in modals
  const handleSaveProduct = (product, productDetails) => {
    console.log("New product:", product);
    console.log("New product details:", productDetails);
    closeAddProductModal();
  };

  const handleCardClick = () => {
    // Check the current path to determine the role
    let path;
    if (location.pathname.includes("/superadmin")) {
      path = "/superadmin/categories";
    } else if (location.pathname.includes("/admin")) {
      path = "/admin/categories";
    } else if (location.pathname.includes("/staff")) {
      path = "/staff/categories";
    } else {
      alert("Access denied");
      return;
    }

    // Navigate to the determined path
    navigate(path);
  };

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <StyledButton onClick={openAddProductModal}>
            <FaPlus className="icon" /> Product
          </StyledButton>
        </ButtonGroup>
      </Controls>
      <AnalyticsContainer>
        <CardTotalProducts />
        <ClickableCard onClick={handleCardClick}>
          <CardTotalCategories />
        </ClickableCard>
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
      {isAddProductModalOpen && (
        <AddProductModal
          onClose={closeAddProductModal}
          onSave={handleSaveProduct}
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ClickableCard = styled.div`
  cursor: pointer;
`;

const ActionButton = styled(Button)`
  background-color: ${colors.primary};
  &:hover {
    background-color: ${colors.primaryHover};
  }

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

// Centering the image column
const ImageWrapper = styled.div`
  display: flex;
  justify-content: center;  // Centers the image horizontally
  align-items: center;      // Centers the image vertically
  width: 100%;              // Ensure full width for centering
`;

export default SharedProductsPage;
