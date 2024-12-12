// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";

import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import NewUserChangePass from "./pages/NewUserChangePass";

// Admin Pages
import AdminDashboard from "./pages/staff/AdminDashboard";
import AdminUsers from "./pages/staff/AdminUsers";
import AdminCustomers from "./pages/staff/AdminCustomers";
import AdminInventory from "./pages/staff/AdminInventory";
import AdminReports from "./pages/staff/AdminReports";
import AdminSuppliers from "./pages/staff/AdminSuppliers";
import AdminRequestOrder from "./pages/staff/AdminRequestOrder";
import AdminCustomerOrder from "./pages/staff/AdminCustomerOrder";
import AdminSupplierOrder from "./pages/staff/AdminSupplierOrder";
import AdminCustomerDelivery from "./pages/staff/AdminCustomerDelivery";
import AdminSupplierDelivery from "./pages/staff/AdminSupplierDelivery";
import AdminProducts from "./pages/staff/AdminProducts";
import AdminPriceHistory from "./pages/staff/AdminPriceHistory";
import AdminSales from "./pages/staff/AdminSales";
import AdminReturns from "./pages/staff/AdminReturns";
import AdminLogs from "./pages/staff/AdminLogs";
import AdminCategories from "./pages/staff/AdminCategories";
import AdminProfile from "./pages/staff/AdminProfile";
import AdminNotification from "./pages/staff/AdminNotification";

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/admin/SuperAdminUsers";
import SuperAdminCustomers from "./pages/admin/SuperAdminCustomers";
import SuperAdminInventory from "./pages/admin/SuperAdminInventory";
import SuperAdminReports from "./pages/admin/SuperAdminReports";
import SuperAdminSuppliers from "./pages/admin/SuperAdminSuppliers";
import SuperAdminRequestOrder from "./pages/admin/SuperAdminRequestOrder";
import SuperAdminCustomerOrder from "./pages/admin/SuperAdminCustomerOrder";
import SuperAdminSupplierOrder from "./pages/admin/SuperAdminSupplierOrder";
import SuperAdminCustomerDelivery from "./pages/admin/SuperAdminCustomerDelivery";
import SuperAdminSupplierDelivery from "./pages/admin/SuperAdminSupplierDelivery";
import SuperAdminProducts from "./pages/admin/SuperAdminProducts";
import SuperAdminPriceHistory from "./pages/admin/SuperAdminPriceHistory";
import SuperAdminSales from "./pages/admin/SuperAdminSales";
import SuperAdminReturns from "./pages/admin/SuperAdminReturns";
import SuperAdminLogs from "./pages/admin/SuperAdminLogs";
import SuperAdminCategories from "./pages/admin/SuperAdminCategories";
import SuperAdminProfile from "./pages/admin/SuperAdminProfile";
import SuperAdminNotification from "./pages/admin/SuperAdminNotification";
import DailyReports from "./pages/admin/DailyReports";
import ExpirationReports from "./pages/admin/ExpirationReports";
import StockReports from "./pages/admin/StockReports";

// Staff Pages
import StaffDashboard from "./pages/prevstaff/StaffDashboard";
import StaffProfile from "./pages/prevstaff/StaffProfile";
import StaffRequestOrder from "./pages/prevstaff/StaffRequestOrder";
import StaffCustomerOrder from "./pages/prevstaff/StaffCustomerOrder";
import StaffCustomerDelivery from "./pages/prevstaff/StaffCustomerDelivery";
import StaffSupplierDelivery from "./pages/prevstaff/StaffSupplierDelivery";
import StaffProducts from "./pages/prevstaff/StaffProducts";
import StaffInventory from "./pages/prevstaff/StaffInventory";
import StaffCustomers from "./pages/prevstaff/StaffCustomers";
import StaffReturns from "./pages/prevstaff/StaffReturns";
import StaffReports from "./pages/prevstaff/StaffReports";
import StaffNotification from "./pages/prevstaff/StaffNotification";
import StaffCategories from "./pages/prevstaff/StaffCategories";

import NotFoundPage from "./pages/NotFoundPage";

// Toast notification utility
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
  custom: (message) => toast(message),
};
// ProtectedRoute component to wrap your routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("access_tokenStorage"); // Check if user is authenticated
  const userType = localStorage.getItem("user_type"); // Get user type (admin, staff, prevstaff)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user type matches any of the allowed roles
  if (!allowedRoles.includes(userType)) {
    return <Navigate to={`/${userType}/dashboard`} replace />;
  }

  return children;
};


function App() { 
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Authentication */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/change-password" element={<NewUserChangePass />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* SuperAdmin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminProfile /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminUsers /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminInventory /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminReports /></ProtectedRoute>} />
            <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminSuppliers /></ProtectedRoute>} />
            <Route path="/admin/request-order" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminRequestOrder /></ProtectedRoute>} />
            <Route path="/admin/customer-order" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminCustomerOrder /></ProtectedRoute>} />
            <Route path="/admin/purchase-order" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminSupplierOrder /></ProtectedRoute>} />
            <Route path="/admin/customer-delivery" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminCustomerDelivery /></ProtectedRoute>} />
            <Route path="/admin/supplier-delivery" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminSupplierDelivery /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminProducts /></ProtectedRoute>} />
            <Route path="/admin/price-history" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminPriceHistory /></ProtectedRoute>} />
            <Route path="/admin/sales" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminSales /></ProtectedRoute>} />
            <Route path="/admin/issues" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminReturns /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogs /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminCategories /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminNotification /></ProtectedRoute>} />
            <Route path="/admin/daily-reports" element={<ProtectedRoute allowedRoles={['admin']}><DailyReports /></ProtectedRoute>} />
            <Route path="/admin/expiration-reports" element={<ProtectedRoute allowedRoles={['admin']}><ExpirationReports /></ProtectedRoute>} />
            <Route path="/admin/stock-reports" element={<ProtectedRoute allowedRoles={['admin']}><StockReports /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><AdminProfile /></ProtectedRoute>} />
            <Route path="/staff/users" element={<ProtectedRoute allowedRoles={['staff']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/staff/customers" element={<ProtectedRoute allowedRoles={['staff']}><AdminCustomers /></ProtectedRoute>} />
            <Route path="/staff/inventory" element={<ProtectedRoute allowedRoles={['staff']}><AdminInventory /></ProtectedRoute>} />
            <Route path="/staff/reports" element={<ProtectedRoute allowedRoles={['staff']}><AdminReports /></ProtectedRoute>} />
            <Route path="/staff/suppliers" element={<ProtectedRoute allowedRoles={['staff']}><AdminSuppliers /></ProtectedRoute>} />
            <Route path="/staff/request-order" element={<ProtectedRoute allowedRoles={['staff']}><AdminRequestOrder /></ProtectedRoute>} />
            <Route path="/staff/customer-order" element={<ProtectedRoute allowedRoles={['staff']}><AdminCustomerOrder /></ProtectedRoute>} />
            <Route path="/staff/purchase-order" element={<ProtectedRoute allowedRoles={['staff']}><AdminSupplierOrder /></ProtectedRoute>} />
            <Route path="/staff/customer-delivery" element={<ProtectedRoute allowedRoles={['staff']}><AdminCustomerDelivery /></ProtectedRoute>} />
            <Route path="/staff/supplier-delivery" element={<ProtectedRoute allowedRoles={['staff']}><AdminSupplierDelivery /></ProtectedRoute>} />
            <Route path="/staff/products" element={<ProtectedRoute allowedRoles={['staff']}><AdminProducts /></ProtectedRoute>} />
            <Route path="/staff/price-history" element={<ProtectedRoute allowedRoles={['staff']}><AdminPriceHistory /></ProtectedRoute>} />
            <Route path="/staff/sales" element={<ProtectedRoute allowedRoles={['staff']}><AdminSales /></ProtectedRoute>} />
            <Route path="/staff/issues" element={<ProtectedRoute allowedRoles={['staff']}><AdminReturns /></ProtectedRoute>} />
            <Route path="/staff/logs" element={<ProtectedRoute allowedRoles={['staff']}><AdminLogs /></ProtectedRoute>} />
            <Route path="/staff/categories" element={<ProtectedRoute allowedRoles={['staff']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/staff/notifications" element={<ProtectedRoute allowedRoles={['staff']}><AdminNotification /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/prevstaff/dashboard" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/prevstaff/profile" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffProfile /></ProtectedRoute>} />
            <Route path="/prevstaff/request-order" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffRequestOrder /></ProtectedRoute>} />
            <Route path="/prevstaff/customer-order" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffCustomerOrder /></ProtectedRoute>} />
            <Route path="/prevstaff/customer-delivery" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffCustomerDelivery /></ProtectedRoute>} />
            <Route path="/prevstaff/supplier-delivery" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffSupplierDelivery /></ProtectedRoute>} />
            <Route path="/prevstaff/products" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffProducts /></ProtectedRoute>} />
            <Route path="/prevstaff/inventory" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffInventory /></ProtectedRoute>} />
            <Route path="/prevstaff/customers" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffCustomers /></ProtectedRoute>} />
            <Route path="/prevstaff/issues" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffReturns /></ProtectedRoute>} />
            <Route path="/prevstaff/reports" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffReports /></ProtectedRoute>} />
            <Route path="/prevstaff/categories" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffCategories /></ProtectedRoute>} />
            <Route path="/prevstaff/notifications" element={<ProtectedRoute allowedRoles={['prevstaff']}><StaffNotification /></ProtectedRoute>} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Toast Container */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}



export default App;
