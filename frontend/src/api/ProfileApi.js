import axios from 'axios';
import { createAuthorizedInstance } from './AuthorizedApi'; // Correctly import the named export

// Base API URL for users
//const API_URL = 'http://127.0.0.1:8000/account/users/'; // Adjust the endpoint based on your API structure
const API_UPDATE = 'http://127.0.0.1:8000/';
const getAccessToken = () => {
    return localStorage.getItem('access_tokenStorage');  // Fetches 'access_token1' from localStorage
};
// Function to fetch user data based on user ID
export const fetchUserData = async (userId = null) => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Access token is not available. Please log in.");
    }

    const resolvedUserId = userId || localStorage.getItem('user_id');
    if (!resolvedUserId) {
        throw new Error("User ID not found. Please ensure you are logged in.");
    }

    try {
        console.log("Authorization Header being sent:", `Bearer ${token}`);
        console.log("Fetching user data for user ID:", resolvedUserId);
        console.log("Using access token:", token); // Check token value here

        // Make the request and directly set the headers
        const response = await axios.get(`http://127.0.0.1:8000/account/logs/${resolvedUserId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Response:', response);
        return response.data;

    } catch (error) {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch user data: " + (error.response?.data?.detail || error.message));
    }
};

export const updateUserData = async (userData) => {
    try {
        // Retrieve the user ID from local storage
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
            throw new Error("User ID not found in local storage");
        }

        // Send the update request to the server
        const response = await createAuthorizedInstance().put(`${API_UPDATE}account/users/update/${userId}/`, userData, {
        headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Return both the data and status code
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        console.error("Error updating user data:", error.response?.data || error.message);
        throw new Error("Failed to update user data: " + (error.response?.data?.detail || error.message));
    }
};

// Function to change the user password
export const changePassword = async (userData) => {
    try {
        // Retrieve the user ID from local storage
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
            throw new Error("User ID not found in local storage");
        }

        // Send the change password request to the server
        const response = await createAuthorizedInstance().put(`${API_UPDATE}account/users/update/${userId}/`, userData, {
            headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

        // Return the response data and status code
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        console.error("Error changing password:", error.response?.data || error.message);
        throw new Error("Failed to change password: " + (error.response?.data?.detail || error.message));
    }
};