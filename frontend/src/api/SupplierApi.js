import axios from "axios";

// Base URL for the supplier API
const BASE_URL = "http://127.0.0.1:8000/supplier";

// Fetch the total number of suppliers
export const fetchTotalSupplier = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/totalSupplier/`);
        console.log('Total suppliers:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch total suppliers', error);
        throw new Error('Failed to fetch total suppliers');
    }
};

// Fetch the list of suppliers
export const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/suppliers/`);
        console.log('Fetched suppliers:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch suppliers', error);
        throw new Error('Failed to fetch suppliers');
    }
};

// Add a new supplier
export const addSupplier = async (newSupplier) => {
    try {
        const response = await axios.post(`${BASE_URL}/suppliers/`, newSupplier);
        console.log('New supplier added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to add supplier:', error);
        throw new Error('Failed to add supplier');
    }
};
