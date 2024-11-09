// src/pages/data/ReturnsData.js
const returnsData = [
  {
    id: 1,
    name: "John Doe",
    returnDate: "2024-06-01",
    type: "Supplier",
    status: "Processing",
    description:
      "Customer returned the product due to a manufacturing defect in the electronic components.",
    products: [
      { productName: "Smartphone", quantity: 1, price: 699 },
      { productName: "Wireless Earbuds", quantity: 1, price: 199 },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    returnDate: "2024-06-02",
    type: "Sales",
    status: "Completed",
    description:
      "Returned due to incorrect size of the apparel items delivered.",
    products: [
      { productName: "Jacket", quantity: 1, price: 120 },
      { productName: "Sneakers", quantity: 1, price: 80 },
    ],
  },
  {
    id: 3,
    name: "Michael Johnson",
    returnDate: "2024-06-03",
    type: "Supplier",
    status: "Processing",
    description:
      "Products did not match the description provided on the website.",
    products: [
      { productName: "Dining Table", quantity: 1, price: 500 },
      { productName: "Chair", quantity: 4, price: 80 },
    ],
  },
  {
    id: 4,
    name: "Emily Davis",
    returnDate: "2024-06-04",
    type: "Sales",
    status: "Pending",
    description:
      "Customer found a better deal elsewhere and decided to return the purchased items.",
    products: [{ productName: "Laptop", quantity: 1, price: 1200 }],
  },
  {
    id: 5,
    name: "Robert Brown",
    returnDate: "2024-06-05",
    type: "Supplier",
    status: "Completed",
    description:
      "The clothing items had minor defects and did not meet customer expectations.",
    products: [
      { productName: "T-shirt", quantity: 3, price: 25 },
      { productName: "Jeans", quantity: 2, price: 50 },
    ],
  },
];

export default returnsData;
