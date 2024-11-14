import axios from "axios";

// Base URL for the staff API
const BASE_URL = "http://127.0.0.1:8000/account";

// Fetch the total number of staff
export const fetchTotalStaff = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/totalActiveStaff/`);
        console.log('Total staff:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch total staff', error);
        throw new Error('Failed to fetch total staff');
    }
};

// Fetch the list of all staff members
export const fetchStaff = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/lists/`);
        console.log('Fetched staff members:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch staff members', error);
        throw new Error('Failed to fetch staff members');
    }
};

// Add a new staff member
export const addStaff = async (newStaff) => {
    try {
        const response = await axios.post(`${BASE_URL}/users/`, newStaff);
        console.log('New staff member added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to add staff member', error);
        throw new Error('Failed to add staff member');
    }
};
