//ProductData.js
// const productData = {
//   PRODUCT_INVENTORY: [
//     {
//       PROD_INV_ID: "",
//       PROD_INV_BATCH_NO: "",
//       PROD_INV_DATE_RCVD: "",
//       PROD_INV_EXP_DATE: "",
//       PROD_INV_QTY_ON_HAND: 0,
//       PROD_INV_QTY_DLVRD: 0,
//       PROD_ID: "",
//       INBOUND_DEL_DETAIL_ID: "",
//     },
//   ],

//   PRODUCT: [
//     {
//       PROD_ID: "",
//       PROD_IMAGE: "",
//       PROD_NAME: "",
//       PROD_DETAILS_CODE: "",
//       PROD_RO_LEVEL: 0,
//       PROD_RO_QTY: 0,
//       PROD_QOH: 0,
//       PROD_IMG: "",
//       PROD_DATECREATED: "",
//       PROD_DATEUPDATED: "",
//       PROD_CAT_CODE: "",
//     },
//   ],
//   PRODUCT_DETAILS: [
//     {
//       PROD_DETAILS_CODE: "",
//       PROD_DETAILS_DESCRIPTION: "",
//       PROD_DETALS_PRICE: 0.0,
//       PROD_DETAILS_SUPPLIER: "",
//       PROD_DETAILS_UNITS: "",
//       PROD_DETAILS_MEASUREMENT: "",
//       PROD_CAT_CODE: "",
//     },
//   ],
//   PRODUCT_CATEGORY: [
//     {
//       PROD_CAT_CODE: "",
//       PROD_CAT_NAME: "",
//       PROD_CAT_SUBCATEGORY: [
//         {
//           PROD_SUBCAT_ID: "",
//           PROD_SUBCAT_NAME: "",
//           PRODUCT: [
//             { PROD_ID: "" },
//           ]
//         },
//       ]
//     },
//   ]
// };

// export default productData;

//ProductData.js
const productData = {
  PRODUCT_INVENTORY: [
    {
      PROD_INV_ID: "INV001",
      PROD_INV_BATCH_NO: "BATCH001",
      PROD_INV_DATE_RCVD: "2024-08-01",
      PROD_INV_EXP_DATE: "2024-08-01",
      PROD_INV_QTY_ON_HAND: 100,
      PROD_INV_QTY_DLVRD: 20,
      PROD_ID: "P001", // Amoxicillin
      INBOUND_DEL_DETAIL_ID: "DEL001",
    },
    {
      PROD_INV_ID: "INV002",
      PROD_INV_BATCH_NO: "BATCH002",
      PROD_INV_DATE_RCVD: "2024-04-01",
      PROD_INV_EXP_DATE: "2024-08-05",
      PROD_INV_QTY_ON_HAND: 90,
      PROD_INV_QTY_DLVRD: 15,
      PROD_ID: "P006", // Cephalexin
      INBOUND_DEL_DETAIL_ID: "DEL002",
    },
    {
      PROD_INV_ID: "INV003",
      PROD_INV_BATCH_NO: "BATCH003",
      PROD_INV_DATE_RCVD: "2024-08-10",
      PROD_INV_EXP_DATE: "2026-08-10",
      PROD_INV_QTY_ON_HAND: 110,
      PROD_INV_QTY_DLVRD: 10,
      PROD_ID: "P007", // Ciprofloxacin
      INBOUND_DEL_DETAIL_ID: "DEL003",
    },
    {
      PROD_INV_ID: "INV004",
      PROD_INV_BATCH_NO: "BATCH004",
      PROD_INV_DATE_RCVD: "2024-08-15",
      PROD_INV_EXP_DATE: "2026-08-15",
      PROD_INV_QTY_ON_HAND: 150,
      PROD_INV_QTY_DLVRD: 5,
      PROD_ID: "P008", // Doxycycline
      INBOUND_DEL_DETAIL_ID: "DEL004",
    },
    {
      PROD_INV_ID: "INV005",
      PROD_INV_BATCH_NO: "BATCH005",
      PROD_INV_DATE_RCVD: "2024-08-20",
      PROD_INV_EXP_DATE: "2026-08-20",
      PROD_INV_QTY_ON_HAND: 1, // Low stock example
      PROD_INV_QTY_DLVRD: 20,
      PROD_ID: "P002", // Anti-Flea Shampoo
      INBOUND_DEL_DETAIL_ID: "DEL005",
    },
    {
      PROD_INV_ID: "INV006",
      PROD_INV_BATCH_NO: "BATCH006",
      PROD_INV_DATE_RCVD: "2024-08-25",
      PROD_INV_EXP_DATE: "2026-08-25",
      PROD_INV_QTY_ON_HAND: 0, // Out of stock example
      PROD_INV_QTY_DLVRD: 0,
      PROD_ID: "P003", // Syringes Pack
      INBOUND_DEL_DETAIL_ID: "DEL006",
    },
    {
      PROD_INV_ID: "INV007",
      PROD_INV_BATCH_NO: "BATCH007",
      PROD_INV_DATE_RCVD: "2024-08-30",
      PROD_INV_EXP_DATE: "2026-08-30",
      PROD_INV_QTY_ON_HAND: 10, // Low stock example
      PROD_INV_QTY_DLVRD: 5,
      PROD_ID: "P004", // Veterinary Thermometer
      INBOUND_DEL_DETAIL_ID: "DEL007",
    },
    {
      PROD_INV_ID: "INV008",
      PROD_INV_BATCH_NO: "BATCH008",
      PROD_INV_DATE_RCVD: "2024-08-30",
      PROD_INV_EXP_DATE: "2026-08-30",
      PROD_INV_QTY_ON_HAND: 0, // Out of stock example
      PROD_INV_QTY_DLVRD: 0,
      PROD_ID: "P005", // Wound Care Ointment
      INBOUND_DEL_DETAIL_ID: "DEL008",
    },
  ],

  PRODUCT: [
    // Antibiotics Category (C001)
    {
      PROD_ID: "P001",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Amoxicillin",
      PROD_DETAILS_CODE: "D001",
      PROD_RO_LEVEL: 30,
      PROD_RO_QTY: 10,
      PROD_QOH: 100,
      PROD_IMG: "amoxicillin.png",
      PROD_DATECREATED: "2024-07-01",
      PROD_DATEUPDATED: "2024-08-10",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_ID: "P006",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Cephalexin",
      PROD_DETAILS_CODE: "D006",
      PROD_RO_LEVEL: 20,
      PROD_RO_QTY: 8,
      PROD_QOH: 90,
      PROD_IMG: "cephalexin.png",
      PROD_DATECREATED: "2024-07-05",
      PROD_DATEUPDATED: "2024-08-12",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_ID: "P007",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Ciprofloxacin",
      PROD_DETAILS_CODE: "D007",
      PROD_RO_LEVEL: 25,
      PROD_RO_QTY: 12,
      PROD_QOH: 110,
      PROD_IMG: "ciprofloxacin.png",
      PROD_DATECREATED: "2024-07-10",
      PROD_DATEUPDATED: "2024-08-14",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_ID: "P008",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Doxycycline",
      PROD_DETAILS_CODE: "D008",
      PROD_RO_LEVEL: 35,
      PROD_RO_QTY: 15,
      PROD_QOH: 150,
      PROD_IMG: "doxycycline.png",
      PROD_DATECREATED: "2024-07-15",
      PROD_DATEUPDATED: "2024-08-16",
      PROD_CAT_CODE: "C001",
    },

    // Flea & Tick Control Category (C002)
    {
      PROD_ID: "P002",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Anti-Flea Shampoo",
      PROD_DETAILS_CODE: "D002",
      PROD_RO_LEVEL: 50,
      PROD_RO_QTY: 15,
      PROD_QOH: 200,
      PROD_IMG: "anti_flea_shampoo.png",
      PROD_DATECREATED: "2024-06-15",
      PROD_DATEUPDATED: "2024-08-15",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_ID: "P009",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Flea Collar",
      PROD_DETAILS_CODE: "D009",
      PROD_RO_LEVEL: 45,
      PROD_RO_QTY: 18,
      PROD_QOH: 220,
      PROD_IMG: "flea_collar.png",
      PROD_DATECREATED: "2024-06-20",
      PROD_DATEUPDATED: "2024-08-17",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_ID: "P010",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Tick Repellent Spray",
      PROD_DETAILS_CODE: "D010",
      PROD_RO_LEVEL: 60,
      PROD_RO_QTY: 25,
      PROD_QOH: 300,
      PROD_IMG: "tick_spray.png",
      PROD_DATECREATED: "2024-06-25",
      PROD_DATEUPDATED: "2024-08-18",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_ID: "P011",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Spot-on Flea Treatment",
      PROD_DETAILS_CODE: "D011",
      PROD_RO_LEVEL: 30,
      PROD_RO_QTY: 10,
      PROD_QOH: 180,
      PROD_IMG: "spot_on_treatment.png",
      PROD_DATECREATED: "2024-07-05",
      PROD_DATEUPDATED: "2024-08-19",
      PROD_CAT_CODE: "C002",
    },

    // Syringes Category (C003)
    {
      PROD_ID: "P003",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Syringes Pack",
      PROD_DETAILS_CODE: "D003",
      PROD_RO_LEVEL: 20,
      PROD_RO_QTY: 5,
      PROD_QOH: 50,
      PROD_IMG: "syringes_pack.png",
      PROD_DATECREATED: "2024-05-01",
      PROD_DATEUPDATED: "2024-08-20",
      PROD_CAT_CODE: "C003",
    },
    {
      PROD_ID: "P012",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Insulin Syringes",
      PROD_DETAILS_CODE: "D012",
      PROD_RO_LEVEL: 30,
      PROD_RO_QTY: 10,
      PROD_QOH: 75,
      PROD_IMG: "insulin_syringes.png",
      PROD_DATECREATED: "2024-05-10",
      PROD_DATEUPDATED: "2024-08-21",
      PROD_CAT_CODE: "C003",
    },
    {
      PROD_ID: "P013",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Oral Dosing Syringes",
      PROD_DETAILS_CODE: "D013",
      PROD_RO_LEVEL: 15,
      PROD_RO_QTY: 7,
      PROD_QOH: 35,
      PROD_IMG: "oral_syringes.png",
      PROD_DATECREATED: "2024-05-15",
      PROD_DATEUPDATED: "2024-08-22",
      PROD_CAT_CODE: "C003",
    },

    // Thermometers Category (C004)
    {
      PROD_ID: "P004",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Veterinary Thermometer",
      PROD_DETAILS_CODE: "D004",
      PROD_RO_LEVEL: 15,
      PROD_RO_QTY: 8,
      PROD_QOH: 40,
      PROD_IMG: "thermometer.png",
      PROD_DATECREATED: "2024-08-01",
      PROD_DATEUPDATED: "2024-08-25",
      PROD_CAT_CODE: "C004",
    },
    {
      PROD_ID: "P014",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Infrared Thermometer",
      PROD_DETAILS_CODE: "D014",
      PROD_RO_LEVEL: 20,
      PROD_RO_QTY: 12,
      PROD_QOH: 60,
      PROD_IMG: "infrared_thermometer.png",
      PROD_DATECREATED: "2024-08-05",
      PROD_DATEUPDATED: "2024-08-26",
      PROD_CAT_CODE: "C004",
    },
    {
      PROD_ID: "P015",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Ear Thermometer",
      PROD_DETAILS_CODE: "D015",
      PROD_RO_LEVEL: 10,
      PROD_RO_QTY: 5,
      PROD_QOH: 25,
      PROD_IMG: "ear_thermometer.png",
      PROD_DATECREATED: "2024-08-10",
      PROD_DATEUPDATED: "2024-08-27",
      PROD_CAT_CODE: "C004",
    },

    // Wound Care Category (C005)
    {
      PROD_ID: "P005",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Wound Care Ointment",
      PROD_DETAILS_CODE: "D005",
      PROD_RO_LEVEL: 25,
      PROD_RO_QTY: 12,
      PROD_QOH: 80,
      PROD_IMG: "wound_care_ointment.png",
      PROD_DATECREATED: "2024-07-20",
      PROD_DATEUPDATED: "2024-08-18",
      PROD_CAT_CODE: "C005",
    },
    {
      PROD_ID: "P016",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Antiseptic Spray",
      PROD_DETAILS_CODE: "D016",
      PROD_RO_LEVEL: 35,
      PROD_RO_QTY: 15,
      PROD_QOH: 100,
      PROD_IMG: "antiseptic_spray.png",
      PROD_DATECREATED: "2024-07-25",
      PROD_DATEUPDATED: "2024-08-19",
      PROD_CAT_CODE: "C005",
    },
    {
      PROD_ID: "P017",
      PROD_IMAGE: "https://via.placeholder.com/50",
      PROD_NAME: "Sterile Gauze Pads",
      PROD_DETAILS_CODE: "D017",
      PROD_RO_LEVEL: 20,
      PROD_RO_QTY: 10,
      PROD_QOH: 70,
      PROD_IMG: "gauze_pads.png",
      PROD_DATECREATED: "2024-07-30",
      PROD_DATEUPDATED: "2024-08-20",
      PROD_CAT_CODE: "C005",
    },
  ],
  PRODUCT_DETAILS: [
    {
      PROD_DETAILS_CODE: "D001",
      PROD_DETAILS_DESCRIPTION:
        "Broad-spectrum antibiotic used to treat bacterial infections.",
      PROD_DETALS_PRICE: 29.99,
      PROD_DETAILS_SUPPLIER: "VetMed",
      PROD_DETAILS_UNITS: "500mg",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_DETAILS_CODE: "D002",
      PROD_DETAILS_DESCRIPTION:
        "Shampoo formulated to eliminate fleas and ticks from pets.",
      PROD_DETALS_PRICE: 15.99,
      PROD_DETAILS_SUPPLIER: "FleaAway",
      PROD_DETAILS_UNITS: "250ml",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_DETAILS_CODE: "D003",
      PROD_DETAILS_DESCRIPTION:
        "Sterile syringes for administering injections.",
      PROD_DETALS_PRICE: 9.99,
      PROD_DETAILS_SUPPLIER: "MedSupply",
      PROD_DETAILS_UNITS: "10ml",
      PROD_DETAILS_MEASUREMENT: "Pack of 10",
      PROD_CAT_CODE: "C003",
    },
    {
      PROD_DETAILS_CODE: "D004",
      PROD_DETAILS_DESCRIPTION:
        "Digital thermometer for accurate temperature readings in animals.",
      PROD_DETALS_PRICE: 22.5,
      PROD_DETAILS_SUPPLIER: "ThermoVet",
      PROD_DETAILS_UNITS: "1 unit",
      PROD_DETAILS_MEASUREMENT: "Unit",
      PROD_CAT_CODE: "C004",
    },
    {
      PROD_DETAILS_CODE: "D005",
      PROD_DETAILS_DESCRIPTION:
        "Ointment for treating wounds and promoting healing.",
      PROD_DETALS_PRICE: 12.99,
      PROD_DETAILS_SUPPLIER: "HealFast",
      PROD_DETAILS_UNITS: "100g",
      PROD_DETAILS_MEASUREMENT: "Tube",
      PROD_CAT_CODE: "C005",
    },
    {
      PROD_DETAILS_CODE: "D006",
      PROD_DETAILS_DESCRIPTION:
        "Effective antibiotic used for treating a wide range of bacterial infections.",
      PROD_DETALS_PRICE: 27.99,
      PROD_DETAILS_SUPPLIER: "VetHealth",
      PROD_DETAILS_UNITS: "250mg",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_DETAILS_CODE: "D007",
      PROD_DETAILS_DESCRIPTION:
        "Antibiotic that treats various types of bacterial infections.",
      PROD_DETALS_PRICE: 32.5,
      PROD_DETAILS_SUPPLIER: "BioPharma",
      PROD_DETAILS_UNITS: "500mg",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_DETAILS_CODE: "D008",
      PROD_DETAILS_DESCRIPTION:
        "Antibiotic for treating respiratory and bacterial infections in animals.",
      PROD_DETALS_PRICE: 28.99,
      PROD_DETAILS_SUPPLIER: "PetMeds",
      PROD_DETAILS_UNITS: "300mg",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C001",
    },
    {
      PROD_DETAILS_CODE: "D009",
      PROD_DETAILS_DESCRIPTION:
        "Flea collar providing long-lasting protection against fleas and ticks.",
      PROD_DETALS_PRICE: 18.99,
      PROD_DETAILS_SUPPLIER: "PestGuard",
      PROD_DETAILS_UNITS: "One size fits all",
      PROD_DETAILS_MEASUREMENT: "Unit",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_DETAILS_CODE: "D010",
      PROD_DETAILS_DESCRIPTION:
        "Spray that effectively repels ticks and prevents infestations.",
      PROD_DETALS_PRICE: 14.99,
      PROD_DETAILS_SUPPLIER: "TickShield",
      PROD_DETAILS_UNITS: "300ml",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_DETAILS_CODE: "D011",
      PROD_DETAILS_DESCRIPTION:
        "Spot-on treatment for eliminating fleas on pets.",
      PROD_DETALS_PRICE: 25.99,
      PROD_DETAILS_SUPPLIER: "QuickFlea",
      PROD_DETAILS_UNITS: "3 doses",
      PROD_DETAILS_MEASUREMENT: "Pack",
      PROD_CAT_CODE: "C002",
    },
    {
      PROD_DETAILS_CODE: "D012",
      PROD_DETAILS_DESCRIPTION:
        "Insulin syringes for precise dosage administration.",
      PROD_DETALS_PRICE: 19.99,
      PROD_DETAILS_SUPPLIER: "MediCare",
      PROD_DETAILS_UNITS: "1ml",
      PROD_DETAILS_MEASUREMENT: "Pack of 10",
      PROD_CAT_CODE: "C003",
    },
    {
      PROD_DETAILS_CODE: "D013",
      PROD_DETAILS_DESCRIPTION:
        "Oral dosing syringes for administering medications to pets.",
      PROD_DETALS_PRICE: 7.99,
      PROD_DETAILS_SUPPLIER: "EasyDose",
      PROD_DETAILS_UNITS: "5ml",
      PROD_DETAILS_MEASUREMENT: "Pack of 5",
      PROD_CAT_CODE: "C003",
    },
    {
      PROD_DETAILS_CODE: "D014",
      PROD_DETAILS_DESCRIPTION:
        "Infrared thermometer for quick and contactless temperature readings.",
      PROD_DETALS_PRICE: 35.99,
      PROD_DETAILS_SUPPLIER: "InfraVet",
      PROD_DETAILS_UNITS: "1 unit",
      PROD_DETAILS_MEASUREMENT: "Unit",
      PROD_CAT_CODE: "C004",
    },
    {
      PROD_DETAILS_CODE: "D015",
      PROD_DETAILS_DESCRIPTION:
        "Ear thermometer for measuring pets' temperature.",
      PROD_DETALS_PRICE: 29.99,
      PROD_DETAILS_SUPPLIER: "PetTemp",
      PROD_DETAILS_UNITS: "1 unit",
      PROD_DETAILS_MEASUREMENT: "Unit",
      PROD_CAT_CODE: "C004",
    },
    {
      PROD_DETAILS_CODE: "D016",
      PROD_DETAILS_DESCRIPTION:
        "Antiseptic spray for cleaning wounds and preventing infection.",
      PROD_DETALS_PRICE: 16.99,
      PROD_DETAILS_SUPPLIER: "FirstAid",
      PROD_DETAILS_UNITS: "250ml",
      PROD_DETAILS_MEASUREMENT: "Bottle",
      PROD_CAT_CODE: "C005",
    },
    {
      PROD_DETAILS_CODE: "D017",
      PROD_DETAILS_DESCRIPTION: "Sterile gauze pads for dressing wounds.",
      PROD_DETALS_PRICE: 5.99,
      PROD_DETAILS_SUPPLIER: "MedClean",
      PROD_DETAILS_UNITS: "10cm x 10cm",
      PROD_DETAILS_MEASUREMENT: "Pack of 20",
      PROD_CAT_CODE: "C005",
    },
  ],

  PRODUCT_CATEGORY: [
    {
      PROD_CAT_CODE: "C001",
      PROD_CAT_NAME: "Antibiotics",
      PROD_CAT_SUBCATEGORY: [
        {
          PROD_SUBCAT_ID: "C001_1",
          PROD_SUBCAT_NAME: "Penicillins",
          PRODUCT: [{ PROD_ID: "P001" }, { PROD_ID: "P006" }],
        },
        {
          PROD_SUBCAT_ID: "C001_2",
          PROD_SUBCAT_NAME: "Fluoroquinolones",
          PRODUCT: [{ PROD_ID: "P007" }],
        },
      ],
    },
    {
      PROD_CAT_CODE: "C002",
      PROD_CAT_NAME: "Flea & Tick Control",
      PROD_CAT_SUBCATEGORY: [
        {
          PROD_SUBCAT_ID: "C002_1",
          PROD_SUBCAT_NAME: "Shampoos",
          PRODUCT: [{ PROD_ID: "P002" }],
        },
        {
          PROD_SUBCAT_ID: "C002_2",
          PROD_SUBCAT_NAME: "Collars",
          PRODUCT: [{ PROD_ID: "P009" }],
        },
      ],
    },
    {
      PROD_CAT_CODE: "C003",
      PROD_CAT_NAME: "Syringes",
      PROD_CAT_SUBCATEGORY: [
        {
          PROD_SUBCAT_ID: "C003_1",
          PROD_SUBCAT_NAME: "General Syringes",
          PRODUCT: [{ PROD_ID: "P003" }, { PROD_ID: "P012" }],
        },
        {
          PROD_SUBCAT_ID: "C003_2",
          PROD_SUBCAT_NAME: "Specialty Syringes",
          PRODUCT: [{ PROD_ID: "P013" }],
        },
      ],
    },
    {
      PROD_CAT_CODE: "C004",
      PROD_CAT_NAME: "Thermometers",
      PROD_CAT_SUBCATEGORY: [
        {
          PROD_SUBCAT_ID: "C004_1",
          PROD_SUBCAT_NAME: "Digital Thermometers",
          PRODUCT: [{ PROD_ID: "P004" }],
        },
        {
          PROD_SUBCAT_ID: "C004_2",
          PROD_SUBCAT_NAME: "Infrared Thermometers",
          PRODUCT: [{ PROD_ID: "P014" }],
        },
      ],
    },
    {
      PROD_CAT_CODE: "C006",
      PROD_CAT_NAME: "Miscellaneous",
      PROD_CAT_SUBCATEGORY: [], // No subcategories
      PRODUCT: [
        { PROD_ID: "P018" }, // Product without a subcategory
      ],
    },
    {
      PROD_CAT_CODE: "C005",
      PROD_CAT_NAME: "Wound Care",
      PROD_CAT_SUBCATEGORY: [
        {
          PROD_SUBCAT_ID: "C005_1",
          PROD_SUBCAT_NAME: "Ointments",
          PRODUCT: [{ PROD_ID: "P005" }],
        },
        {
          PROD_SUBCAT_ID: "C005_2",
          PROD_SUBCAT_NAME: "Gauze",
          PRODUCT: [{ PROD_ID: "P017" }],
        },
      ],
    },
  ],
};

export default productData;
