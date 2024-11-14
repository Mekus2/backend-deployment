import axios from "axios";

// Base URL for the customer API
const BASE_URL = "http://127.0.0.1:8000/customer";

// Fetch the total number of customers
export const fetchTotalCustomer = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/totalClients/`);
        console.log('Total customers:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch total customers', error);
        throw new Error('Failed to fetch total customers');
    }
};

// Fetch the list of customers
export const fetchCustomers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/clients/`);
        console.log('Fetched customers:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customers', error);
        throw new Error('Failed to fetch customers');
    }
};

// Add a new customer
export const addCustomer = async (newClient) => {
    try {
        const response = await axios.post(`${BASE_URL}/clients/`, newClient);
        console.log('New customer added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to add customer:', error);
        throw new Error('Failed to add customer');
    }
};
