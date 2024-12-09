const INBOUND_DELIVERY = {
  INBOUND_DELIVERY: [
    {
      INBOUND_DEL_ID: "INB001",
      INBOUND_DEL_DATE_RCVD: "2024-08-01",
      INBOUND_DEL_STATUS: "Awaiting",
      INBOUND_DEL_DLVRY_OPT: "Air",
      INBOUND_DEL_RCVD_QTY: 80,
      INBOUND_DEL_PROD_TOTAL: 1600,
      INBOUND_DEL_DATECREATED: "2024-07-25",
      INBOUND_DEL_DATEUPDATED: "2024-08-01",
      INBOUND_DEL_RCVD_BY_USER_ID: "USR001", // User ID who received this delivery
      PURCHASE_ORDER_ID: "PO001", // Linked Supplier Order ID
      SUPP_ID: "SUP001", // Supplier ID
      USER: {
        USER_ID: "25",
        USER_USERNAME: "superadmin_stephenmartinez",
        USER_FIRSTNAME: "Stephen",
        USER_LASTNAME: "Martinez",
        USER_EMAIL: "stephen.martinez@gmail.com",
        USER_PHONENUMBER: "321-654-9870",
        USER_ADDRESS: "258 Pine St, Springfield, USA",
        USER_ACCTTYPE: "SuperAdmin",
        USER_ISACTIVE: true,
        USER_AGE: 45,
      },
      SUPPLIER: {
        SUPP_ID: "SUP001",
        SUPP_NAME: "PharmaCo",
        SUPP_CONTACT: "John Supplier",
        SUPP_EMAIL: "contact@pharmaco.com",
        SUPP_PHONE: "123-456-7890",
      },
    },
    {
      INBOUND_DEL_ID: "INB002",
      INBOUND_DEL_DATE_RCVD: "2024-08-10",
      INBOUND_DEL_STATUS: "Dispatched",
      INBOUND_DEL_DLVRY_OPT: "Sea",
      INBOUND_DEL_RCVD_QTY: 100,
      INBOUND_DEL_PROD_TOTAL: 2400,
      INBOUND_DEL_DATECREATED: "2024-08-05",
      INBOUND_DEL_DATEUPDATED: "2024-08-09",
      INBOUND_DEL_RCVD_BY_USER_ID: "USR002", // User ID who received this delivery
      PURCHASE_ORDER_ID: "PO002",
      SUPP_ID: "SUP002", // Supplier ID
      USER: {
        USER_ID: "6",
        USER_USERNAME: "admin_alicewilliams",
        USER_FIRSTNAME: "Alice",
        USER_LASTNAME: "Williams",
        USER_EMAIL: "alice.williams@gmail.com",
        USER_PHONENUMBER: "678-901-2345",
        USER_ADDRESS: "321 Birch St, Springfield, USA",
        USER_ACCTTYPE: "Staff",
        USER_ISACTIVE: true,
        USER_AGE: 31,
      },
      SUPPLIER: {
        SUPP_ID: "SUP002",
        SUPP_NAME: "MediCorp",
        SUPP_CONTACT: "Alice Supplier",
        SUPP_EMAIL: "contact@medicorp.com",
        SUPP_PHONE: "987-654-3210",
      },
    },
  ],
  INBOUND_DELIVERY_DETAILS: [
    {
      INBOUND_DEL_DETAIL_ID: "DEL001",
      INBOUND_DEL_ID: "INB001",
      PROD_ID: "P001",
      PROD_NAME: "Amoxicillin",
      INBOUND_DEL_DETAIL_QTY_DLVRD: 50,
      INBOUND_DEL_DETAIL_EXPIRY_DATE: "2025-08-01",
      PRICE_PER_UNIT: 10.0, // Price per unit in USD
    },
    {
      INBOUND_DEL_DETAIL_ID: "DEL002",
      INBOUND_DEL_ID: "INB001",
      PROD_ID: "P006",
      PROD_NAME: "Cephalexin",
      INBOUND_DEL_DETAIL_QTY_DLVRD: 30,
      INBOUND_DEL_DETAIL_EXPIRY_DATE: "2025-08-01",
      PRICE_PER_UNIT: 12.0,
    },
    {
      INBOUND_DEL_DETAIL_ID: "DEL003",
      INBOUND_DEL_ID: "INB002",
      PROD_ID: "P007",
      PROD_NAME: "Ciprofloxacin",
      INBOUND_DEL_DETAIL_QTY_DLVRD: 20,
      INBOUND_DEL_DETAIL_EXPIRY_DATE: "2025-08-15",
      PRICE_PER_UNIT: 100.0, // Price per unit in PHP
    },
    {
      INBOUND_DEL_DETAIL_ID: "DEL004",
      INBOUND_DEL_ID: "INB002",
      PROD_ID: "P008",
      PROD_NAME: "Doxycycline",
      INBOUND_DEL_DETAIL_QTY_DLVRD: 60,
      INBOUND_DEL_DETAIL_EXPIRY_DATE: "2026-01-10",
      PRICE_PER_UNIT: 8.5,
    },
    {
      INBOUND_DEL_DETAIL_ID: "DEL005",
      INBOUND_DEL_ID: "INB001",
      PROD_ID: "P009",
      PROD_NAME: "Ibuprofen",
      INBOUND_DEL_DETAIL_QTY_DLVRD: 25,
      INBOUND_DEL_DETAIL_EXPIRY_DATE: "2025-12-01",
      PRICE_PER_UNIT: 5.0,
    },
  ],
};

export default INBOUND_DELIVERY;
