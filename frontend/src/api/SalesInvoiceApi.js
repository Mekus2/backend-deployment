import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";
// Function to fetch sales invoices with search term and pagination
export async function fetchSalesInvoices(
  searchTerm = "",
  page = 1,
  pageSize = 10
) {
  try {
    // Construct the URL with search, page, and page_size query parameters
    const url = new URL("http://127.0.0.1:8000/sales/list/");
    const params = new URLSearchParams();

    // Add search term if provided
    if (searchTerm) {
      params.append("search", searchTerm);
    }

    // Add pagination parameters
    params.append("page", page);
    params.append("page_size", pageSize);

    // Append the parameters to the URL
    url.search = params.toString();

    // Perform the GET request
    const response = await fetch(url);

    // Check if the response is successful (status code 200)
    if (!response.ok) {
      throw new Error("Failed to fetch sales invoices");
    }

    // Parse the JSON response
    const data = await response.json();

    // Return the data (sales invoices)
    return data;
  } catch (error) {
    console.error("Error fetching sales invoices:", error);
    throw error; // Re-throw error to be handled by the caller
  }
}

export async function updateInvoice(invoiceId, terms, amount, amountPaid) {
  try {
    const response = await fetch(
      `http://localhost:8000/sales/${invoiceId}/payment`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terms: terms,
          amount: amount,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update the invoice.");
    }

    const updatedInvoice = await response.json();
    return updatedInvoice; // This is the updated invoice data returned from the backend.
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

export const FetchSalesReport = async ({
  searchTermType,
  searchTerm,
  page = 1,
}) => {
  try {
    // Build the query parameters for the API request based on searchTermType
    const params = {
      search_term_type: "customer", // The type of the search (e.g., "customer", "date", etc.)
      search_term: searchTerm, // The actual value of the search (e.g., name, date, etc.)
      page: page, // Page number for pagination
    };

    // Make the API call to the backend
    const response = await axios.get(`${BASE_URL}/sales/sales-report/`, {
      params,
    });

    // Return the response data
    console.log("Fetched Reports Data:", response.data);
    return response.data; // Assuming the backend response contains 'results' and 'count' fields
  } catch (error) {
    console.error("Error fetching sales report:", error);
    throw error; // Propagate error to be handled in the calling component
  }
};
