// src/utils/indexedDB.js
import { openDB } from 'idb';

// Define the version number
const DB_VERSION = 1; // Increment this if you change the schema

// Initialize IndexedDB and create object stores if they don't exist
export const initDB = async () => {
  return openDB('dashboardLayoutDB', DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create object store for layouts
      if (!db.objectStoreNames.contains('layouts')) {
        db.createObjectStore('layouts', { keyPath: 'id' });
      }

      // Create object store for company details
      if (!db.objectStoreNames.contains('companyDetails')) {
        db.createObjectStore('companyDetails', { keyPath: 'id' });
      }

      // Upgrade logic for future versions can be added here
      if (oldVersion < 1) {
        // Example of handling migrations if needed
      }
    },
  });
};

// Save layout order to IndexedDB
export const saveLayout = async (type, key, layout) => {
  const db = await initDB();
  const prefixedKey = `${type}_${key}`;
  await db.put('layouts', { id: prefixedKey, layout });
};

// Get layout order from IndexedDB
export const getLayout = async (type, key) => {
  const db = await initDB();
  const prefixedKey = `${type}_${key}`;
  const entry = await db.get('layouts', prefixedKey);
  return entry ? entry.layout : null;
};

// Save company details to IndexedDB
export const saveCompanyDetails = async (details) => {
  const db = await initDB();
  await db.put('companyDetails', { id: 'companyInfo', ...details });
};

// Get company details from IndexedDB
export const getCompanyDetails = async () => {
  const db = await initDB();
  const entry = await db.get('companyDetails', 'companyInfo');
  return entry ? { name: entry.name, address: entry.address, contact: entry.contact } : null;
};
