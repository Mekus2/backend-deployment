import axios from 'axios';

// Function to create an authorized Axios instance
export const createAuthorizedInstance = () => {
    const token = localStorage.getItem('access_tokenStorage'); // Get the access token from local storage
    console.log("Using access token:", token); // Log the token for debugging

    return axios.create({
        baseURL: 'http://127.0.0.1:8000/', // Set your base URL here
        headers: {
            'Authorization': `Bearer ${token}`, // Set the Authorization header
            'Content-Type': 'application/json', // Optional: set content type
        },
    });
};
