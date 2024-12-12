const IssueData = [
  {
    ISSUE_ID: "ISSUE001",
    OUTBOUND_DEL_ID: "OD12345",
    CUSTOMER_NAME: "John Doe",
    ISSUE_TYPE: "Damaged Packaging",
    ISSUE_DESCRIPTION: "Packaging was damaged during delivery. Product is intact but the packaging needs replacement.",
    REPORTED_DATE: "2024-11-01",
    RESOLUTION_STATUS: "Pending",
    ACTION_REQUIRED: "Offset Product",
    REMARKS: "Packaging needs replacement.",
    PRODUCTS: [
      {
        productName: "Dog Food",
        quantity: 5,
        defectQuantity: 2, // Example: 2 defective units
        price: 500,
      },
    ],
  },
  {
    ISSUE_ID: "ISSUE002",
    OUTBOUND_DEL_ID: "OD12346",
    CUSTOMER_NAME: "Jane Smith",
    ISSUE_TYPE: "Incorrect Product Delivered",
    ISSUE_DESCRIPTION: "Received wrong product (cat food instead of dog food).",
    REPORTED_DATE: "2024-11-02",
    RESOLUTION_STATUS: "Resolved",
    ACTION_REQUIRED: "Replaced Product",
    REMARKS: "Customer received an incorrect product.",
    PRODUCTS: [
      {
        productName: "Cat Food",
        quantity: 3,
        defectQuantity: 3, // All defective in this case
        price: 300,
      },
    ],
  },
  {
    ISSUE_ID: "ISSUE003",
    OUTBOUND_DEL_ID: "OD12347",
    CUSTOMER_NAME: "Emily Johnson",
    ISSUE_TYPE: "No Issues Reported",
    ISSUE_DESCRIPTION: "No issues with the delivery or product.",
    REPORTED_DATE: "2024-11-03",
    RESOLUTION_STATUS: "Pending",
    ACTION_REQUIRED: "No Action Required",
    REMARKS: "Customer confirmed no issues.",
    PRODUCTS: [
      {
        productName: "Veterinary Supplement",
        quantity: 2,
        defectQuantity: 0, // No defects
        price: 750,
      },
    ],
  },
  {
    ISSUE_ID: "ISSUE004",
    OUTBOUND_DEL_ID: "OD12348",
    CUSTOMER_NAME: "Michael Brown",
    ISSUE_TYPE: "Delayed Shipment",
    ISSUE_DESCRIPTION: "Shipment is delayed and is still in transit.",
    REPORTED_DATE: "2024-11-04",
    RESOLUTION_STATUS: "Pending",
    ACTION_REQUIRED: "Offset Product",
    REMARKS: "Delay in delivery due to shipment issues.",
    PRODUCTS: [
      {
        productName: "Dog Collar",
        quantity: 10,
        defectQuantity: 1, // Example defect
        price: 200,
      },
    ],
  },
  {
    ISSUE_ID: "ISSUE005",
    OUTBOUND_DEL_ID: "OD12349",
    CUSTOMER_NAME: "Sarah Lee",
    ISSUE_TYPE: "Expired Product",
    ISSUE_DESCRIPTION: "The delivered product was expired, and customer requested a replacement.",
    REPORTED_DATE: "2024-11-05",
    RESOLUTION_STATUS: "Resolved",
    ACTION_REQUIRED: "Replaced Product",
    REMARKS: "Customer requested a replacement for the expired product.",
    PRODUCTS: [
      {
        productName: "Pet Shampoo",
        quantity: 1,
        defectQuantity: 1, // Defective product
        price: 300,
      },
    ],
  },
  {
    ISSUE_ID: "ISSUE006",
    OUTBOUND_DEL_ID: "OD12350",
    CUSTOMER_NAME: "Lisa White",
    ISSUE_TYPE: "Missing Item",
    ISSUE_DESCRIPTION: "Customer claims that the ordered item was not included in the delivery.",
    REPORTED_DATE: "2024-11-06",
    RESOLUTION_STATUS: "Pending",
    ACTION_REQUIRED: "Offset Product",
    REMARKS: "Missing product needs to be shipped separately.",
    PRODUCTS: [
      {
        productName: "Pet Bed",
        quantity: 1,
        defectQuantity: 0, // No defect, just missing
        price: 1500,
      },
    ],
  },
];

export default IssueData;
