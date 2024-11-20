// utils/authUtils.js

export const checkUserAccess = () => {
    const userType = localStorage.getItem('user_type'); // Assume you store the logged-in user's type in localStorage
    const currentPath = window.location.pathname;  // Get the current URL path

    // Check if the user's accType matches the page they are trying to access
    if (userType === 'superadmin' && !currentPath.startsWith('/superadmin')) {
        alert("You don't have permission to access this page.");
        window.location.href = '/superadmin/dashboard';  // Redirect to the superadmin page or any other appropriate page
        return;
    }

    if (userType === 'admin' && !currentPath.startsWith('/admin')) {
        alert("You don't have permission to access this page.");
        window.location.href = '/admin/dashboard';  // Redirect to the admin page or any other appropriate page
        return;
    }

    if (userType === 'staff' && !currentPath.startsWith('/staff')) {
        alert("You don't have permission to access this page.");
        window.location.href = '/staff/dashboard';  // Redirect to the staff page or any other appropriate page
        return;
    }
};

// Call this function on every page load or on route change
checkUserAccess();
