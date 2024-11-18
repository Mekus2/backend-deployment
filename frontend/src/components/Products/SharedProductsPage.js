import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductList } from "../../api/ProductApi";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import CardTotalCategories from "../CardsData/CardTotalCategories";
import Button from "../Layout/Button";
import AddProductModal from "./AddProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { FaPlus } from "react-icons/fa";
import { colors } from "../../colors";
import { fetchCategory } from "../../api/CategoryApi";
import axios from 'axios';
import Loading from "../Layout/Loading"; // Import the Loading component

const SharedProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [product, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        // Fetch products
        const fetchedProducts = await fetchProductList();
        console.log('fetchedProducts:', fetchedProducts);
        setProducts(fetchedProducts);

        // Filter products based on search term
        const filteredProducts = fetchedProducts.filter((product) =>
          product.PROD_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Get unique category codes
        const uncachedCategoryCodes = [...new Set(
          filteredProducts.map((product) => product.PROD_DETAILS["PROD_CAT_CODE"])
        )];

        console.log("uncachedCategoryCodes:", uncachedCategoryCodes);

        // Fetch categories if uncached codes are found
        const uncachedCategories = uncachedCategoryCodes.length > 0 
          ? await Promise.all(uncachedCategoryCodes.map(fetchCategory)) 
          : [];

        // Map products to rows
        const rowsData = filteredProducts.map((product) => {
          console.log('Product ID:', product.id); // Log product IDs for debugging
          console.log('Product Object:', product);  // To verify that the correct product is passed
          const prodId = product.id;
          console.log('prod IDDD:',prodId);
          const productDetail = product.PROD_DETAILS;
          const category = uncachedCategories.find(
            (cat) => cat.PROD_CAT_CODE === productDetail.PROD_CAT_CODE
          );

          const unit = productDetail.PROD_DETAILS_UNIT || "N/A";
          const brand = productDetail.PROD_DETAILS_BRAND || "N/A";
          const price = parseFloat(productDetail.PROD_DETAILS_PRICE);

          return [
            <img
              src={product.PROD_IMAGE}
              alt={product.PROD_NAME}
              style={{ width: "50px", height: "auto" }}
            />,
            product.PROD_NAME,
            category ? category.PROD_CAT_NAME : "N/A",
            unit,
            brand,
            price && !isNaN(price) ? `₱${price.toFixed(2)}` : "₱0.00",
            <ActionButton
              key="action"
              fontSize="14px"
              onClick={() => openProductDetailsModal(product)}
            >
              Details
            </ActionButton>,
          ];
        });

        setRows(rowsData);
        setLoading(false);
        console.log('rowsData:', rowsData);
      } catch (err) {
        setError("Error fetching products or categories");
        setLoading(false);
      }
    };

    loadProductsAndCategories();
  }, [searchTerm]); // Re-run if searchTerm changes

  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);

  const openProductDetailsModal = async (product) => {
    try {
      // Ensure product.id is a valid number or string
      const productResponse = await axios.get(`http://127.0.0.1:8000/items/productList/${product.id}`);
      console.log('Product API Response:', productResponse.data); // Log the product data
  
      // Set only the product ID into state
      setSelectedProductId(product.id);
  
      // Open the modal with the selected product ID
      setIsProductDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const closeProductDetailsModal = () => {
    setSelectedProductId(null);
    setIsProductDetailsModalOpen(false);
  };

  const handleCardClick = () => {
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
    navigate(path);
  };

  if (loading) {
    return <Loading />;  // Use the Loading component while loading
  }

  if (error) {
    return (
      <ErrorContainer>
        <div>{error}</div>
      </ErrorContainer>
    );
  }

  const headers = [
    "Image",
    "Product Name",
    "Category",
    "Unit",
    "Brand",
    "Price",
    "Actions",
  ];

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
        <AddProductModal onClose={closeAddProductModal} />
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

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default SharedProductsPage;
