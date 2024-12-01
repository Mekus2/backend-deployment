import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { fetchProductList } from "../../api/ProductApi";
import SearchBar from "../Layout/SearchBar_Modified";
import Table from "../Layout/Table_Pagination";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import Button from "../Layout/Button";
import AddProductModal from "./AddProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { FaPlus } from "react-icons/fa";
import { colors } from "../../colors";
// import axios from "axios";
import Loading from "../Layout/Loading"; // Import the Loading component

const SharedProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0); // Track total rows
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce hook for search term
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  // Function to load products
  const loadProducts = async (page = 1) => {
    try {
      setLoading(true); // Start loading before fetching
      const data = await fetchProductList(page, 10, debouncedSearchTerm);
      const { results, count } = data;
      console.log("Search Results:", results);

      const rowsData = results.map((product) => {
        const productDetail = product.PROD_DETAILS;
        const brand = productDetail?.PROD_DETAILS_SUPPLIER || "N/A";
        const price = parseFloat(productDetail?.PROD_DETAILS_PRICE || 0);

        return [
          // <ImageContainer key={product.PROD_ID}>
          //   <img
          //     src={product.PROD_IMAGE}
          //     alt={product.PROD_NAME}
          //     style={{ width: "50px", height: "auto" }}
          //   />
          // </ImageContainer>,
          product.PROD_NAME,
          <TagList key={`tags-${product.PROD_ID}`}>
            {(productDetail?.TAGS || ["No Tags"]).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagList>,
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
      setTotalRows(count); // Set the total rows count for pagination
      setLoading(false);
    } catch (err) {
      setError("Error fetching products. Please try again later.");
      setLoading(false);
      console.error("Error fetching products:", err);
    }
  };

  // Effect for loading products
  useEffect(() => {
    loadProducts(currentPage); // Pass currentPage to load products
  }, [debouncedSearchTerm, currentPage]); // Add currentPage to the effect's dependency

  // Open/close modals
  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);

  const openProductDetailsModal = (product) => {
    setSelectedProductId(product.PROD_ID);
    setIsProductDetailsModalOpen(true);
  };

  const closeProductDetailsModal = () => {
    setSelectedProductId(null);
    setIsProductDetailsModalOpen(false);
  };

  // Search bar change handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Trigger search when Enter key is pressed
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent page refresh
      loadProducts(currentPage); // Trigger search when Enter is pressed
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [
    // "Image",
    "Product Name",
    "Tags",
    "Supplier",
    "Price",
    "Actions",
  ];

  return (
    <>
      <AnalyticsContainer>
        <CardTotalProducts />
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter product..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
        />
        <ButtonGroup>
          <StyledButton onClick={openAddProductModal}>
            <FaPlus className="icon" /> Product
          </StyledButton>
        </ButtonGroup>
      </Controls>
      <Table
        headers={headers}
        rows={rows}
        rowsPerPage={10}
        currentPage={currentPage}
        totalRows={totalRows}
        onPageChange={setCurrentPage} // Set page number via prop
      />
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
const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-height: 120px;
  overflow-y: auto;
  justify-content: center;
`;

const Tag = styled.div`
  background-color: ${colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  text-align: center;
  min-width: 50px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// const ImageContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 100%;
// `;

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

export default SharedProductsPage;
