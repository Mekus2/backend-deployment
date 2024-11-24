import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductList } from "../../api/ProductApi";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import Button from "../Layout/Button";
import AddProductModal from "./AddProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { FaPlus } from "react-icons/fa";
import { colors } from "../../colors";
import { fetchCategory } from "../../api/CategoryApi";
import axios from "axios";
import Loading from "../Layout/Loading"; // Import the Loading component

const SharedProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] =
    useState(false);
  const [product, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        const fetchedProducts = await fetchProductList();
        setProducts(fetchedProducts);

        const filteredProducts = fetchedProducts.filter((products) =>
          products.PROD_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const uncachedCategoryCodes = [
          ...new Set(
            filteredProducts.map((product) =>
              product.PROD_DETAILS?.PROD_CAT_CODE !== null
                ? product.PROD_DETAILS?.PROD_CAT_CODE
                : null
            )
          ),
        ];

        const uncachedCategories =
          uncachedCategoryCodes.length > 0
            ? await Promise.all(uncachedCategoryCodes.map(fetchCategory))
            : [];

        const rowsData = filteredProducts.map((product) => {
          const productDetail = product.PROD_DETAILS;

          // Static sample tags data
          const sampleTags = ["Tag1", "Tag2"];

          const brand = productDetail.PROD_DETAILS_SUPPLIER || "N/A";
          const price = parseFloat(productDetail.PROD_DETAILS_PRICE);

          return [
            <ImageContainer key={product.PROD_ID}>
              <img
                src={product.PROD_IMAGE}
                alt={product.PROD_NAME}
                style={{ width: "50px", height: "auto" }}
              />
            </ImageContainer>,
            product.PROD_NAME,
            <TagList key={`tags-${product.PROD_ID}`}>
              {sampleTags.map((tag, index) => (
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

        setRows(rowsData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching products or categories");
        setLoading(false);
        console.error("Error fetching products", err);
      }
    };

    loadProductsAndCategories();
  }, [searchTerm]);

  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);

  const openProductDetailsModal = async (product) => {
    try {
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/items/productList/${product.id}`
      );

      setSelectedProductId(product.id);
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
    return <Loading />; // Use the Loading component here
  }

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [
    "Image",
    "Product Name",
    "Tags",
    "Supplier",
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
            <p value={product}></p>
          </StyledButton>
        </ButtonGroup>
      </Controls>
      <AnalyticsContainer>
        <CardTotalProducts />
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




const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

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

export default SharedProductsPage;
