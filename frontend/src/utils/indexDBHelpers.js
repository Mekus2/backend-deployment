//indexDBHelpers.js
const DB_NAME = "CompanyDB";
const STORE_NAME = "companyDetails";
const VERSION = 1;

// Open or create a new IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(`Error opening DB: ${event.target.error}`);
    };
  });
};

// Save company details to IndexedDB
export const saveCompanyDetailsToDB = async (details) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put({ id: 1, ...details });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => {
        reject(`Error saving details: ${event.target.error}`);
      };
    });
  } catch (error) {
    console.error("Failed to save company details", error);
  }
};

// Retrieve company details from IndexedDB
export const getCompanyDetailsFromDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(1);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(`Error retrieving details: ${event.target.error}`);
      };
    });
  } catch (error) {
    console.error("Failed to get company details", error);
  }
};
