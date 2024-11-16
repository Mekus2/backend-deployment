const BASE_URL = "http://127.0.0.1:8000/";
const categoryCache = new Map();  // Cache for storing category data

// Function to fetch category data by code with caching
export const fetchCategory = async (categoryCode) => {
  // Check if category data is in the cache
  if (categoryCache.has(categoryCode)) {
    console.log(`Returning cached category data for ${categoryCode}`);
    return categoryCache.get(categoryCode);  // Return cached data
  }

  try {
    const response = await fetch(`${BASE_URL}/items/categories/${categoryCode}/`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch category");
    }
    
    const categoryData = await response.json();
    
    // Cache the fetched data
    categoryCache.set(categoryCode, categoryData);
    
    return categoryData;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

// Function to fetch all categories (if needed)
export const fetchAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/product/categories/`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    
    const data = await response.json();
    return data;  // Adjust according to your API's response format
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Function to create a new category (if needed)
export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error("Failed to create category");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
};

// Function to update a category (if needed)
export const updateCategory = async (categoryCode, categoryData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/${categoryCode}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error("Failed to update category");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Function to delete a category (if needed)
export const deleteCategory = async (categoryCode) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/${categoryCode}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete category");
    }

    return true;  // Success
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;  // Failure
  }
};
