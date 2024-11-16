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
    setSupplierID(supplier.id);
    setContactPersonName(supplier.Supp_Contact_Pname);
    setContactPersonNumber(supplier.Supp_Contact_Num);
    setSupplierCompanyName(supplier.Supp_Company_Name);
    setSupplierCompanyNum(supplier.Supp_Company_Num);

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

  const handleSave = () => {
    return new Promise((resolve, reject) => {
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

        if (onSave) {
          onSave(newOrder); // Call onSave with order data
        }

        if (onClose) {
          onClose(); // Close modal after save
        }

        resolve(); // Resolve promise for success
      } catch (error) {
        reject(error); // Reject promise on error
      }
    });
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
