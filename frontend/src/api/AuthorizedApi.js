import axios from 'axios';

export const createAuthorizedInstance = () => {
    const token = localStorage.getItem('access_tokenStorage'); // Retrieve the access token

    return axios.create({
        baseURL: 'http://127.0.0.1:8000', // Your API base URL
        headers: {
            'Authorization': `Bearer ${token}`, // Attach the token in the Authorization header
            'Content-Type': 'application/json'
        }
    });
};  