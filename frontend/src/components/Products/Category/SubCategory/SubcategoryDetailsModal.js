import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../../Layout/Modal";
import { colors } from "../../../../colors";
import SearchBar from "../../../Layout/SearchBar";
import { FaPlus } from "react-icons/fa";
import Button from "../../../Layout/Button";
import Table from "../../../Layout/Table";
import Card from "../../../Layout/Card";
import EditSubcategoryModal from "./EditSubcategoryModal";
import SubCatAddProduct from "./SubCatAddProduct";
import ProductDetailsModal from "../../ProductDetailsModal";

const SubcategoryDetailsModal = ({ subcategory = {}, products = [], onClose }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddProductMode, setIsAddProductMode] = useState(false); // State to control Add Product modal
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Mock table headers and rows for the UI
  const headers = ["Product Name", "Quantity on Hand", "Actions"];
  const rows = products.length > 0 
    ? products.map((product, index) => [
        product.PROD_NAME || "N/A",              // Product name
        product.QUANTITY_ON_HAND || 0,           // Quantity on hand
        <ActionCell key={`action-${product?.PROD_ID || index}`}>
          <Button variant="primary" onClick={() => setSelectedProductId(product?.PROD_ID)}>
            Details
          </Button>
          <Button
            backgroundColor={colors.red}
            hoverColor={colors.redHover}
            style={{ marginLeft: "10px" }}
          >
            Remove
          </Button>
        </ActionCell>
      ])
    : [[<NoProductsCell colSpan={3}>No products found.</NoProductsCell>]];

  return (
    <Modal title={`Subcategory: ${subcategory.PROD_SUBCAT_NAME}`} onClose={onClose}>
      <SearchBarContainer>
        <SearchBar placeholder="Search products..." />
        <ButtonGroup>
          <AddProductButton variant="primary" onClick={() => setIsAddProductMode(true)}>
            <FaPlus style={{ marginRight: "5px" }} /> Add Product
          </AddProductButton>
        </ButtonGroup>
      </SearchBarContainer>

      <SubcategoryCardContainer>
        <Card
          label={subcategory.PROD_SUBCAT_NAME}
          value={products.length}
          bgColor={colors.secondary}
          icon={<FaPlus />}
        />
      </SubcategoryCardContainer>

      <Table headers={headers} rows={rows} />

      <ButtonGroup>
        <Button variant="primary" onClick={() => setIsEditMode(true)}>
          Edit Subcategory
        </Button>
      </ButtonGroup>

      {isEditMode && (
        <EditSubcategoryModal
          subcategoryDetails={subcategory}
          onSave={() => setIsEditMode(false)}
          onClose={() => setIsEditMode(false)}
        />
      )}

      {isAddProductMode && (
        <SubCatAddProduct
          availableProducts={products}
          onAddProduct={() => setIsAddProductMode(false)}
          onClose={() => setIsAddProductMode(false)}
        />
      )}

      {selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
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

const SubcategoryCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
`;

export default SubcategoryDetailsModal;
