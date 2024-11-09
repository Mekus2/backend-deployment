import { useState } from "react";
import {
  calculateLineTotal,
  calculateTotalQuantity,
  calculateTotalValue,
} from "../utils/CalculationUtils";
import clientsData from "../data/ClientsData"; // Adjusted the path and import name
import productData from "../data/ProductData"; // Adjust the path as needed

const useAddCustomerOrderModal = (onSave, onClose) => {
  // Initialize products from product data
  const products = productData.PRODUCT.map((product) => ({
    id: product.PROD_ID,
    name: product.PROD_NAME,
    detailsCode: product.PROD_DETAILS_CODE,
    price: 0, // This will be updated when a product is selected
  }));

  // State variables
  const [clientName, setClientName] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientProvince, setClientProvince] = useState("");
  const [clientEmail, setClientEmail] = useState("");
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
      discountType: "amount", // Default to a fixed discount
    },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState(clientsData);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  // Handlers
  const handleAddClient = () => {
    setClientName("");
    setClientCity("");
    setClientProvince("");
    setClientEmail("");
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
        discountType: "amount", // Ensure a default discount type
      },
    ]);
  };

  const handleProductInputChange = (index, value) => {
    setCurrentEditingIndex(index);
    setProductSearch(value);

    const lowerCaseValue = value.toLowerCase();

    // Filter and sort products based on input
    const filtered = products
      .filter((product) => product.name.toLowerCase().includes(lowerCaseValue))
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerCaseValue);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerCaseValue);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });

    setFilteredProducts(filtered);

    // Update order details with the current product name
    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].productName = value;
      return updatedOrderDetails;
    });
  };

  const handleProductSelect = (index, product) => {
    const productDetail = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.detailsCode
    );

    setOrderDetails((prevOrderDetails) => {
      const updatedOrderDetails = [...prevOrderDetails];
      updatedOrderDetails[index].productId = product.id;
      updatedOrderDetails[index].productName = product.name;
      updatedOrderDetails[index].price = productDetail
        ? productDetail.PROD_DETALS_PRICE
        : 0;
      updatedOrderDetails[index].lineTotal = calculateLineTotal(
        updatedOrderDetails[index]
      );

      return updatedOrderDetails;
    });

    setProductSearch("");
    setFilteredProducts(products); // Reset product list
    setCurrentEditingIndex(null);
  };

  const handleClientInputChange = (value) => {
    setClientSearch(value);

    const filtered = clientsData.filter((client) =>
      client.CLIENT_NAME.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleClientSelect = (client) => {
    setClientName(client.CLIENT_NAME);
    setClientCity(client.CLIENT_CITY);
    setClientProvince(client.CLIENT_PROVINCE);
    setClientEmail(client.CLIENT_EMAIL);

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
    const today = new Date().toISOString().split("T")[0];

    const newOrder = {
      orderType: "Customer Order",
      clientName,
      clientCity,
      clientProvince,
      clientEmail,
      deliveryOption,
      paymentTerms,
      orderDate: today,
      orderStatus: "Pending",
      totalQuantity: calculateTotalQuantity(orderDetails),
      totalValue: calculateTotalValue(orderDetails),
      orderDetails: orderDetails.map(({ lineTotal, ...rest }) => rest),
    };

    onSave(newOrder);
    onClose();
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
    clientName,
    setClientName,
    clientCity,
    setClientCity,
    clientProvince,
    setClientProvince,
    clientEmail,
    setClientEmail,
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
  };
};

export default useAddCustomerOrderModal;
