import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Add an issue using the DeliveryIssueCreateAPIView endpoint.
 *
 * @param {Object} issueData - The issue data to be submitted.
 * @param {string} issueData.issueType - The type of the issue (e.g., "Damaged Product").
 * @param {string} issueData.resolution - The proposed resolution (e.g., "Refund").
 * @param {string} issueData.remarks - A detailed description of the issue.
 * @param {Array} issueData.products - A list of products affected by the issue.
 *        Each product should include:
 *          - productId: ID of the product
 *          - defectiveQuantity: Quantity affected
 * @returns {Promise<Object>} The response from the API.
 * @throws {Error} If the API request fails.
 */
const submitIssueTicket = async (issueData) => {
  const url = `${API_BASE_URL}/api/delivery/issue/submit-issue/`;

  try {
    const response = await axios.post(url, issueData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Fetched data", response.data);
    return response.data; // Return the API response
  } catch (error) {
    console.error("Failed to create issue:", error);
    throw error;
  }
};

export default submitIssueTicket;

// fetchIssueList.js

export async function fetchIssueList(orderType = null) {
  try {
    // Build the URL with optional ORDER_TYPE query parameter if provided
    let url = `${API_BASE_URL}/api/delivery/issue/issue-list/`;
    if (orderType) {
      url += `?ORDER_TYPE=${orderType}`;
    }

    // Fetch the data from the API
    const response = await fetch(url, {
      method: "GET", // HTTP method
      headers: {
        "Content-Type": "application/json", // Set content type to JSON
      },
    });

    // Check if the response is OK (status code 200)
    if (!response.ok) {
      throw new Error("Failed to fetch issues");
    }

    // Parse the JSON response
    const issues = await response.json();

    // Return the issues data
    console.log("Fetched data", issues);
    return issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
}
