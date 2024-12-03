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
