import axios from 'axios';
import Cookies from 'js-cookie'; // Ensure js-cookie is installed

const API_URL = 'http://localhost:8000/'; // Base URL for the API

// Function to log in
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}login/`, credentials);
        console.log(response.data); // Check response data

        // Destructure response data to get the tokens and other user information
        const { access, refresh, id, type, first_name, isActive } = response.data;

        // Check if the account is active
        if (isActive) {
            throw new Error('Account is inactive. Please contact support.');
        }

        // Store the access token in cookies with an 8-hour expiration
        if (access) {
            Cookies.set('access_tokenStorage', access, { expires: 1 / 3 }); // Expires in 8 hours
            Cookies.set('user_id', id, { expires: 1 / 3 }); // Expires in 8 hours
            console.log("Access token stored in cookies with an 8-hour expiration.");
        }

        // Store refresh token and other user information in localStorage
        if (refresh) {
            localStorage.setItem('refresh_token', refresh);
        }
        localStorage.setItem('access_tokenStorage', access); 
        localStorage.setItem('user_id', id);
        localStorage.setItem('user_type', type);
        localStorage.setItem('user_first_name', first_name); // Add first name to localStorage
        console.log("Login successful! Tokens and user data stored.");
        return response.data; // Return user data if needed
    } catch (error) {
        console.error("Error during login:", error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : { detail: error.message };
    }
};

// Function to log out
export const logoutUser = async () => {
    try {
        // Retrieve refresh token from localStorage
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('Refresh token not available');
        }

        // Send POST request to logout endpoint with refresh token
        await axios.post(`${API_URL}logout/`, { refresh: refreshToken });

        // Clear cookies and localStorage data on logout
        Cookies.remove('access_tokenStorage'); // Remove access token cookie
        localStorage.removeItem('access_tokenStorage');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_first_name'); // Remove first name from localStorage

        console.log("Logout successful! Tokens removed from storage.");
    } catch (error) {
        console.error("Error during logout:", error.response ? error.response.data : error);
        throw error.response ? error.response.data : error;
    }
};
