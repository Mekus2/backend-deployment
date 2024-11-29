import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/items"; // Base URL for the product API

// Function to get the list of products
// export const fetchProductList = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/productList/`);
//     console.log("Fetched Product List:", response.data);
//     return response.data; // Return the data from the response
//   } catch (error) {
//     console.error("Error fetching product list:", error);
//     throw error;
//   }
// };

export const fetchProductList = async (
  page = 1,
  pageSize = 10,
  searchTerm = ""
) => {
  try {
    const response = await axios.get(`${BASE_URL}/productList/`, {
      params: {
        page, // Current page number
        page_size: pageSize, // Number of products per page
        search: searchTerm, // Add search query
      },
    });
    console.log("Fetched Product List:", response.data);
    return response.data; // Includes paginated data and metadata
  } catch (error) {
    console.error("Error fetching product list:", error);
    throw error;
  }
};

// Function to get product details by ID
export const fetchProductDetails = async (productId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/product-details/${productId}/`
    );
    return response.data; // Return the data from the response
  } catch (error) {
    console.error(`Error fetching product details for ID ${productId}:`, error);
    throw error;
  }
};

// Function to create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/productDetails/`,
      productData
    );
    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Function to update an existing product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/product-details/${productId}/`,
      productData
    );
    return response.data; // Return the data from the response
  } catch (error) {
    console.error(`Error updating product with ID ${productId}:`, error);
    throw error;
  }
};

// Function to delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/product-details/${productId}/`
    );
    return response.data; // Return a success message or confirmation
  } catch (error) {
    console.error(`Error deleting product with ID ${productId}:`, error);
    throw error;
  }
};

// Function to get a specific product category by ID
export const fetchProductCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`${BASE_URL}/categories/${categoryId}/`); // Fetch category by ID
    return response.data; // Return the data from the response
  } catch (error) {
    console.error(
      `Error fetching product category with ID ${categoryId}:`,
      error
    );
    throw error;
  }
};

// Function to get the total number of products
export const fetchTotalProduct = async () => {
  try {
    // Send GET request to the backend
    const response = await axios.get(`${BASE_URL}/total/`); // Make sure to use template literals correctly

    // Ensure the data is in the expected format
    console.log("Fetched Data:", response.data); // Log to check the structure of the data

    // Return the total product count from the response
    return response.data; // Return the data (e.g., { total: 100 })
  } catch (error) {
    // Handle errors here
    console.error("Failed to fetch total products:", error);
    throw new Error("Failed to fetch total products");
  }
};

export const fetchTotalCategory = async () => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/product/totalCategories/`
    );
    console.log("total categories:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch total categories", error);
    throw new Error("Failed to fetch total categories"); // Corrected error message
  }
};
