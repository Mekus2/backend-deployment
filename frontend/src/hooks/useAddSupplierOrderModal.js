import { useState, useEffect, useRef } from "react";
import {
  calculateLineTotal,
  calculateTotalQuantity,
  calculateTotalValue,
} from "../utils/CalculationUtils";
// import { suppliers } from "../data/SupplierData";
//import productData from "../data/ProductData"; // Adjust the path as needed
import axios from "axios";
// import { FaAviato } from "react-icons/fa";

import { getProductByName } from "../api/fetchProducts";
import { addNewPurchaseOrder } from "../api/fetchPurchaseOrders";

const useAddSupplierOrderModal = (onSave, onClose) => {
  // State variables
  const [supplierData, setSupplierData] = useState([]);
  const [supplierID, setSupplierID] = useState(0);
  const [supplierName, setSupplierName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonNumber, setContactPersonNumber] = useState("");
  const [supplierCompanyNum, setSupplierCompanyNum] = useState("");
  const [supplierCompanyName, setSupplierCompanyName] = useState("");
  const [editable, setEditable] = useState(false);
  const [orderDetails, setOrderDetails] = useState([
    {
      productId: "",
      productName: "",
      price: 0,
      quantity: 1,
    },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/supplier/suppliers/"
        );
        setSupplierData(response.data);
        console.log("Supplier Data:", response.data);
        setFilteredSuppliers(response.data);
      } catch (err) {
        console.log("Failed to fetch Suppliers:", err);
      }
    };

    fetchSuppliers();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handlers
  const handleAddSupplier = () => {
    setContactPersonName("");
    setContactPersonNumber("");
    setSupplierCompanyName("");
    setSupplierCompanyNum("");
    setEditable(true);
  };

  const handleAddProduct = () => {
    setOrderDetails((prevOrderDetails) => [
      ...prevOrderDetails,
      {
        productId: "",
        productName: "",
        quantity: 1,
      },
    ]);
  };
// Add validation when manually setting supplier data
const validateSupplierInput = () => {
  if (!supplierCompanyNum || supplierCompanyNum.length !== 11) {
    alert("Supplier Company Number must be 11 digits.");
    return false;
  }
  return true;
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

  // Separate function to handle fetching products
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleProductSelect = (index, product) => {
    console.log("Index in handleProductSelect:", index);
    console.log("Selected product:", product);

    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];

      // Log for debugging
      console.log(`Updating order details at index ${index} with product data`);
      console.log(`Product ID: ${product.id}`);
      console.log(`Product Name: ${product.PROD_NAME}`);

      // Update the Order Details
      updatedOrderDetails[index].productId = product.id;
      updatedOrderDetails[index].productName = product.PROD_NAME;

      return updatedOrderDetails;
    });

    // Log for debuggging
    console.log("Resetting product search and suggestions");
    setProductSearch("");
    setFilteredProducts([]); // Reset product list
    setCurrentEditingIndex(null);
  };

  const handleSupplierInputChange = (value) => {
    setSupplierSearch(value);

    const filtered = supplierData.filter((supplier) =>
      supplier.Supp_Company_Name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  const handleSupplierSelect = (supplier) => {
    console.log("Selected Supplier Details:", supplier);
    console.log("Supplier Company Number from supplier object:", supplier.Supp_Company_Num);
  
    setSupplierID(supplier.id);
    setContactPersonName(supplier.Supp_Contact_Pname);
    setContactPersonNumber(supplier.Supp_Contact_Num);
    setSupplierCompanyName(supplier.Supp_Company_Name);
  
    // Log the value before setting it
    console.log("Setting Supplier Company Number:", supplier.Supp_Company_Num);
    setSupplierCompanyNum(supplier.Supp_Company_Num);
  
    console.log("Supplier Company Number after selection:", supplier.Supp_Company_Num);
  
    setSupplierSearch("");
    setFilteredSuppliers([]);
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

      return updatedOrderDetails;
    });
  };

  const handlePriceChange = (index, value) => {
    const price = value === "" ? 0 : Math.max(0, parseFloat(value));
    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].price = price;
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );

      return updatedOrderDetails;
    });
  };

  const handleSave = async () => {
    // Validate supplier input
    if (!validateSupplierInput()) {
      return; // Exit if validation fails
    }
  
    try {
      const newOrder = {
        PURCHASE_ORDER_TOTAL_QTY: calculateTotalQuantity(orderDetails),
        PURCHASE_ORDER_SUPPLIER_ID: supplierID,
        PURCHASE_ORDER_SUPPLIER_CMPNY_NUM: supplierCompanyNum,
        PURCHASE_ORDER_SUPPLIER_CMPNY_NAME: supplierCompanyName,
        PURCHASE_ORDER_CONTACT_PERSON: contactPersonName,
        PURCHASE_ORDER_CONTACT_NUMBER: contactPersonNumber,
        PURCHASE_ORDER_CREATEDBY_USER: 1,
        details: orderDetails.map((item) => ({
          PURCHASE_ORDER_DET_PROD_ID: item.productId,
          PURCHASE_ORDER_DET_PROD_NAME: item.productName,
          PURCHASE_ORDER_DET_PROD_LINE_QTY: item.quantity,
        })),
      };
  
      console.log("Final Data to be passed:", newOrder);
  
      const createdOrder = await addNewPurchaseOrder(newOrder);
      console.log("Order Saved:", createdOrder);
  
      if (onSave) onSave(newOrder);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };
  
  

  const logAddSupplierOrder = async (createdOrder) => {
    // Retrieve the userId from localStorage
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID is missing from localStorage");
      return;
    }

    try {
      // Fetch user details from the backend using the userId
      const userResponse = await fetch(
        `http://127.0.0.1:8000/account/logs/${userId}/`
      );
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("Failed to fetch user details:", errorData);
        return;
      }
      const userData = await userResponse.json();
      const username = userData.username; // Assuming the API response includes a `username` field

      // Log the createdOrder data for debugging purposes
      console.log("Created Order:", createdOrder);

      // Get the Sales ID from the created order
      const IDD = createdOrder.PURCHASE_ORDER_ID;

      // Validate the essential fields before proceeding
      if (!supplierCompanyName) {
        console.error("Missing clientName, deliveryOption, or paymentTerms");
        return;
      }

      // Prepare the log payload
      const logPayload = {
        LLOG_TYPE: "User logs",
        LOG_DESCRIPTION: `${username} placed a new Supplier order (ID: ${IDD}) for ${supplierCompanyName}. `,
        USER_ID: userId,
      };

      // Send the log payload to the server to create a log entry
      const logResponse = await fetch("http://127.0.0.1:8000/logs/logs/", {
        method: "POST",
        body: JSON.stringify(logPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (logResponse.ok) {
        console.log("Supplier Order log successfully created:", logPayload);
      } else {
        const logErrorData = await logResponse.json();
        console.error("Failed to create log:", logErrorData);
      }
    } catch (error) {
      console.error("Error logging order creation:", error);
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

  return {
    supplierName,
    setSupplierName,
    contactPersonName,
    setContactPersonName,
    contactPersonNumber,
    setContactPersonNumber,
    supplierCompanyNum,
    setSupplierCompanyNum,
    supplierCompanyName,
    setSupplierCompanyName,
    editable,
    orderDetails,
    setOrderDetails, // Ensure setOrderDetails is returned here
    productSearch,
    filteredProducts,
    supplierSearch,
    filteredSuppliers,
    currentEditingIndex,
    handleAddProduct,
    handleProductInputChange,
    handleProductSelect,
    handleSupplierInputChange,
    handleSupplierSelect,
    handleQuantityChange,
    handleDiscountChange,
    handlePriceChange,
    handleSave,
    handleRemoveProduct,
    handleAddSupplier,
    totalQuantity,
    totalValue,
  };
};

export default useAddSupplierOrderModal;
