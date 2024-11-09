import { openDB } from "idb";

// Define the version number for the notifications DB
const DB_VERSION = 1; // Increment this if you change the schema

// Initialize the Notifications IndexedDB and create object store if it doesn't exist
export const initNotificationsDB = async () => {
  return openDB('notificationsDB', DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create an object store for notifications
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    },
  });
};

// ------------------------ Notification Functions ------------------------

// Save notification read/unread status to Notifications IndexedDB
export const saveNotificationStatus = async (id, read) => {
  const db = await initNotificationsDB();
  await db.put('notifications', { id, read });
};

// Get read/unread status for a specific notification from Notifications IndexedDB
export const getNotificationStatus = async (id) => {
  const db = await initNotificationsDB();
  const entry = await db.get('notifications', id);
  return entry ? entry.read : null; // Returns true if read, false otherwise
};

// Get count of unread notifications from Notifications IndexedDB
export const getUnreadCount = async () => {
  const db = await initNotificationsDB();
  const transaction = db.transaction('notifications', 'readonly');
  const store = transaction.objectStore('notifications');
  
  const allNotifications = await store.getAll();
  const unreadCount = allNotifications.filter(notif => !notif.read).length;
  
  return unreadCount;
};

// Mark all notifications as read in Notifications IndexedDB
export const markAllNotificationsAsRead = async () => {
  const db = await initNotificationsDB();
  const transaction = db.transaction('notifications', 'readwrite');
  const store = transaction.objectStore('notifications');
  
  const allNotifications = await store.getAll();
  allNotifications.forEach(async (notif) => {
    if (!notif.read) {
      await store.put({ ...notif, read: true });
    }
  });
};
