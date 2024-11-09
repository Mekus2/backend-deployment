import { useState } from "react";
import {
  calculateLineTotal,
  calculateTotalQuantity,
  calculateTotalValue,
} from "../utils/CalculationUtils";
import { suppliers } from "../data/SupplierData";
import productData from "../data/ProductData"; // Adjust the path as needed

const useAddSupplierOrderModal = (onSave, onClose) => {
  // Initialize products from product data
  const products = productData.PRODUCT.map((product) => ({
    id: product.PROD_ID,
    name: product.PROD_NAME,
    detailsCode: product.PROD_DETAILS_CODE,
    price: 0, // This will be updated when a product is selected
  }));

  // State variables
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
      discountValue: 0,
      lineTotal: 0,
      discountType: "amount", // Default to a fixed discount
    },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

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

  const handleSupplierInputChange = (value) => {
    setSupplierSearch(value);

    const filtered = suppliers.filter((supplier) =>
      supplier.SUPP_COMPANY_NAME.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  const handleSupplierSelect = (supplier) => {
    setSupplierName(supplier.SUPP_CONTACT_NAME);
    setContactPersonName(supplier.SUPP_CONTACT_NAME);
    setContactPersonNumber(supplier.SUPP_CONTACT_PHNUM);
    setSupplierCompanyName(supplier.SUPP_COMPANY_NAME);
    setSupplierCompanyNum(supplier.SUPP_COMPANY_NUM);

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
    const today = new Date().toISOString().split("T")[0];

    const newOrder = {
      orderType: "Supplier Order",
      supplierName: supplierCompanyName,
      supplierNumber: supplierCompanyNum,
      contactPersonName,
      contactPersonNumber,
      purchaseOrderDlvryDate: today,
      purchaseOrderStatus: "Pending",
      purchaseOrderTotQty: calculateTotalQuantity(orderDetails),
      purchaseOrderTotal: calculateTotalValue(orderDetails),
      clientId: "",
      purchaseOrderDetails: orderDetails.map(({ lineTotal, ...rest }) => rest),
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
