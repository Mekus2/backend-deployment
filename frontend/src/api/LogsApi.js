import axios from "axios";

// Base API URLs
const LOGS_API_URL = "http://127.0.0.1:8000/logs/logs/";
const USER_LOGS_API_URL = `${LOGS_API_URL}user/`;
const TRANSACTION_LOGS_API_URL = `${LOGS_API_URL}transaction/`;
const USERS_API_URL = "http://127.0.0.1:8000/account/logs/";

// Fetch all logs
export const fetchLogs = async () => {
  try {
    const response = await axios.get(LOGS_API_URL);
    return response.data; // Logs data is in response.data
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

// Fetch logs by type (user or transaction)
export const fetchLogsByType = async (type) => {
  const url = type === "user" ? USER_LOGS_API_URL : TRANSACTION_LOGS_API_URL;
  try {
    const response = await axios.get(url);
    return response.data; // Logs data is in response.data
  } catch (error) {
    console.error(`Error fetching ${type} logs:`, error);
    throw error;
  }
};

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(USERS_API_URL);
    return response.data; // Array of users
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// Fetch user by ID
export const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`${USERS_API_URL}${userId}/`);
    return response.data; // User data is in response.data
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Create a new log
export const createLog = async (logData) => {
  try {
    // Get the user_id from localStorage
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    // Prepare the log data with the user_id
    const logPayload = {
      ...logData,
      USER_ID: userId, // Add the user_id to the log payload
    };

    // Send a POST request to create the log
    const response = await axios.post(LOGS_API_URL, logPayload);
    return response.data; // The created log data is returned
  } catch (error) {
    console.error("Error creating log:", error);
    throw error;
  }
};

export const fetchTotalLogs = async  () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/logs/total/`);
    console.log('Total logs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch total logs');
    throw new Error('Failed error');
  }
};