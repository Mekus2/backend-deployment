import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../../../colors";
import productData from "../../../data/ProductData";
import AddCategoryModal from "../../Products/Category/AddCategoryModal";
import CategoryDetailsModal from "../../Products/Category/CategoryDetailsModal";
import SearchBar from "../../Layout/SearchBar";
import Card from "../../Layout/Card";
import Button from "../../Layout/Button";
import { FaPlus, FaBox } from "react-icons/fa"; // FaBox as a constant product icon

const SharedCategoryPage = () => {
  const [categories, setCategories] = useState(productData.PRODUCT_CATEGORY);
  const [products] = useState(productData.PRODUCT); // Correctly access product data
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Count products for each category
  const countProductsByCategory = (categoryCode) => {
    return products.filter((product) => product.PROD_CAT_CODE === categoryCode)
      .length;
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.PROD_CAT_NAME.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleAddCategory = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <StyledButton
            backgroundColor={colors.primary}
            hoverColor={colors.primaryHover}
            onClick={() => setIsAddModalOpen(true)}
          >
            <FaPlus className="icon" /> Category
          </StyledButton>
        </ButtonGroup>
      </Controls>
      <AnalyticsContainer>
        {/* Display Total Categories Card */}
        <Card
          label="Total Categories"
          value={categories.length}
          bgColor={colors.secondary}
          icon={<FaBox />}
        />
      </AnalyticsContainer>
      <CategoriesContainer>
        {filteredCategories.map((category) => (
          <CardWrapper
            key={category.PROD_CAT_CODE}
            onClick={() => handleCardClick(category)}
          >
            <Card
              label={category.PROD_CAT_NAME}
              value={countProductsByCategory(category.PROD_CAT_CODE)}
              bgColor={colors.primary}
              icon={<FaBox />}
            />
          </CardWrapper>
        ))}
      </CategoriesContainer>
      {isAddModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddCategory}
        />
      )}
      {isDetailsModalOpen && selectedCategory && (
        <CategoryDetailsModal
          category={selectedCategory} // Pass the selected category to the modal
          products={products.filter(
            (product) =>
              product.PROD_CAT_CODE === selectedCategory.PROD_CAT_CODE
          )} // Filter products for the selected category
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </>
  );
};

// Styled Components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
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
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
`;

const CardWrapper = styled.div`
  cursor: pointer;
  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
`;

export default SharedCategoryPage;
