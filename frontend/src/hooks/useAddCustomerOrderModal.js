import { useState, useEffect, useRef } from "react";
import {
  calculateLineTotal,
  calculateTotalQuantity,
  calculateTotalValue,
  calculateTotalDiscount,
} from "../utils/CalculationUtils";
// import clientsData from "../data/ClientsData"; // Adjusted the path and import name
// import productData from "../data/ProductData"; // Adjust the path as needed
import axios from "axios";
import { getProductByName } from "../api/fetchProducts";
import { addNewCustomerOrder } from "../api/fetchCustomerOrders";

const useAddCustomerOrderModal = (onSave, onClose) => {
  // Initialize products from product data
  // const products = productData.PRODUCT.map((product) => ({
  //   id: product.PROD_ID,
  //   name: product.PROD_NAME,
  //   detailsCode: product.PROD_DETAILS_CODE,
  //   price: 0, // This will be updated when a product is selected
  // }));

  // State variables
  const [clientName, setClientName] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientProvince, setClientProvince] = useState("");
  const [clientId, setClientId] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [editable, setEditable] = useState(false);
  const [orderDetails, setOrderDetails] = useState([
    {
      productId: "",
      productName: "",
      price: 0,
      quantity: 1,
      discountValue: 0,
      lineTotal: 0,
    },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientsData, setClientsData] = useState([]); // To store fetched clients
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  // Fetch clients data from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/customer/clients/"
        );
        setClientsData(response.data); // Store fetched clients
        console.log("Clients Data:", response.data); // Debug line to check if data is properly set
        setFilteredClients(response.data); // Initialize filteredClients with fetched data
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };

    fetchClients();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handlers
  const handleAddClient = () => {
    setClientName("");
    setClientCity("");
    setClientProvince("");
    setEditable(true);
  };

  const handleAddProduct = () => {
    setOrderDetails((prevOrderDetails) => [
      ...prevOrderDetails,
      {
        productId: "",
        productName: "",
        price: 0,
        quantity: 1,
        discountValue: 0,
        lineTotal: 0,
      },
    ]);
  };

  const handleProductInputChange = (index, value) => {
    console.log(`Input changed at index ${index}: ${value}`); // Log the input change
    setCurrentEditingIndex(index);
    setProductSearch(value); // Update immediately for input responsiveness

    // Clear any previously set timeout to avoid multiple fetches
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log("Cleared previous debounce timeout"); // Log debounce timeout clearance
    }

    // Set a new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      console.log(`Fetching products for: ${value}`); // Log before fetching
      fetchFilteredProducts(value, index); // Fetch products after delay
    }, 800); // Adjust delay as needed (e.g., 300ms)
  };

  // Separate function to handle fetching products
  const fetchFilteredProducts = async (searchValue) => {
    console.log(`Starting fetch for: ${searchValue}`); // Log the fetch initiation
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log("Aborted previous fetch request"); // Log abort action
      }

      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      // Fetch products from the API based on user input with signal for aborting
      console.log("Calling API to get products..."); // Log API call initiation
      const fetchedProducts = await getProductByName(
        searchValue,
        newAbortController.signal
      );

      console.log("Fetched products:", fetchedProducts); // Log the fetched products

      // Filter and sort products based on input
      const lowerCaseValue = searchValue.toLowerCase();
      const filtered = fetchedProducts
        .filter((product) =>
          product.PROD_NAME.toLowerCase().includes(lowerCaseValue)
        )
        .sort((a, b) => {
          const aStartsWith =
            a.PROD_NAME.toLowerCase().startsWith(lowerCaseValue);
          const bStartsWith =
            b.PROD_NAME.toLowerCase().startsWith(lowerCaseValue);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.PROD_NAME.localeCompare(b.PROD_NAME);
        });

      console.log("Filtered and sorted products:", filtered); // Log filtered products
      setFilteredProducts(filtered);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted"); // Log abort error
      } else {
        console.error("Failed to fetch products:", error); // Log general fetch failure
      }
    }
  };

  // React useRef hooks to store timeout ID and abort controller
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleProductSelect = (index, product) => {
    console.log(`Selected product:`, product); // Log the selected product

    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];

      console.log(`Updating order details at index ${index} with product data`);
      console.log(`Product ID: ${product.id}`);
      console.log(`Product Name: ${product.PROD_NAME}`);
      console.log(
        `Product Price: ${product.PROD_DETAILS["PROD_DETAILS_PRICE"] || 0}`
      );

      updatedOrderDetails[index].productId = product.id;
      updatedOrderDetails[index].productName = product.PROD_NAME;
      updatedOrderDetails[index].price =
        parseFloat(product.PROD_DETAILS["PROD_DETAILS_PRICE"]) || 0;
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );

      console.log(`Updated order details:`, updatedOrderDetails[index]); // Log updated order details
      return updatedOrderDetails;
    });

    console.log("Resetting product search and suggestions"); // Log reset actions
    setProductSearch("");
    setFilteredProducts([]); // Reset product list
    setCurrentEditingIndex(null);
  };

  const handleClientInputChange = (value) => {
    setClientSearch(value);

    const filtered = clientsData.filter((client) =>
      client.name.toLowerCase().includes(value.toLowerCase())
    );

    console.log("Filtered clients:", filtered); // Log filtered results
    setFilteredClients(filtered);
  };

  const handleClientSelect = (client) => {
    setClientName(client.name);
    setClientCity(client.address);
    setClientProvince(client.province);
    setClientId(client.id);
    setClientSearch("");
    setFilteredClients([]);
  };

  const handleQuantityChange = (index, value) => {
    const quantity = Math.max(1, value);
    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].quantity = quantity;
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );

      return updatedOrderDetails;
    });
  };

  const handleDiscountChange = (index, value) => {
    const discount = value === "" ? 0 : parseFloat(value);
    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].discountValue = discount;
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );
      // Log the event after discount amount changes
      console.log(
        `Updated order details after discount change:`,
        updatedOrderDetails[index]
      );
      return updatedOrderDetails;
    });
  };

  const handlePriceChange = (index, value) => {
    const price = value === "" ? 0 : Math.max(0, parseFloat(value));
    console.log(`Changing price at index ${index} to: ${price}`);

    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].price = price; // Ensure price is stored as a number
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );

      console.log(
        `Updated order details after price change:`,
        updatedOrderDetails[index]
      );
      return updatedOrderDetails;
    });
  };
  const handleSave = async () => {
    console.log("Present Order Details:", orderDetails);

    const newOrder = {
      SALES_ORDER_STATUS: "Pending",
      SALES_ORDER_CREATEDBY_USER: 1, // Replace with actual user ID if dynamic
      CLIENT_ID: clientId,
      SALES_ORDER_CLIENT_NAME: clientName,
      SALES_ORDER_CLIENT_PROVINCE: clientProvince,
      SALES_ORDER_CLIENT_CITY: clientCity,
      SALES_ORDER_DLVRY_OPTION: deliveryOption,
      SALES_ORDER_PYMNT_OPTION: paymentTerms,
      SALES_ORDER_TOTAL_QTY: calculateTotalQuantity(orderDetails),
      SALES_ORDER_TOTAL_PRICE: parseFloat(
        calculateTotalValue(orderDetails).toFixed(2)
      ), // Ensure this is a number
      SALES_ORDER_TOTAL_DISCOUNT: calculateTotalDiscount(orderDetails) || 0, // Updated discount logic
      details: orderDetails.map((item) => ({
        SALES_ORDER_PROD_ID: item.productId,
        SALES_ORDER_PROD_NAME: item.productName,
        SALES_ORDER_LINE_PRICE: parseFloat(item.price) || 0, // Ensure this is a number
        SALES_ORDER_LINE_QTY: item.quantity,
        SALES_ORDER_LINE_DISCOUNT: item.discountValue || 0,
        SALES_ORDER_LINE_TOTAL: item.lineTotal,
      })),
    };

    console.log("Final Data to be passed:", newOrder);

    try {
      console.log(newOrder);
      const createdOrder = await addNewCustomerOrder(newOrder);
      console.log("Order saved:", createdOrder);

      alert("Order has been saved successfully!"); // Display confirmation alert

      onSave(); // Notify parent component or UI
      onClose(); // Close modal or UI element

      window.location.reload(); // Refresh the page after closing
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleRemoveProduct = (index) => {
    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails.splice(index, 1);
      return updatedOrderDetails;
    });
  };

  // Calculate totals
  const totalQuantity = calculateTotalQuantity(orderDetails);
  const totalValue = calculateTotalValue(orderDetails);
  const totalDiscount = calculateTotalDiscount(orderDetails);

  return {
    clientName,
    setClientName,
    clientCity,
    setClientCity,
    clientProvince,
    setClientProvince,
    clientId,
    setClientId,
    deliveryOption,
    setDeliveryOption,
    paymentTerms,
    setPaymentTerms,
    editable,
    orderDetails,
    setOrderDetails,
    productSearch,
    filteredProducts,
    clientSearch,
    filteredClients,
    currentEditingIndex,
    handleAddProduct,
    handleProductInputChange,
    handleProductSelect,
    handleClientInputChange,
    handleClientSelect,
    handleQuantityChange,
    handleDiscountChange,
    handlePriceChange,
    handleSave,
    handleRemoveProduct,
    handleAddClient,
    totalQuantity,
    totalValue,
    totalDiscount,
  };
};

export default useAddCustomerOrderModal;
