// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { UserProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";

import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import NewUserChangePass from "./pages/NewUserChangePass";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReports from "./pages/admin/AdminReports";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminRequestOrder from "./pages/admin/AdminRequestOrder";
import AdminCustomerOrder from "./pages/admin/AdminCustomerOrder";
import AdminSupplierOrder from "./pages/admin/AdminSupplierOrder";
import AdminCustomerDelivery from "./pages/admin/AdminCustomerDelivery";
import AdminSupplierDelivery from "./pages/admin/AdminSupplierDelivery";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPriceHistory from "./pages/admin/AdminPriceHistory";
import AdminSales from "./pages/admin/AdminSales";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminNotification from "./pages/admin/AdminNotification";

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminCustomers from "./pages/superadmin/SuperAdminCustomers";
import SuperAdminInventory from "./pages/superadmin/SuperAdminInventory";
import SuperAdminReports from "./pages/superadmin/SuperAdminReports";
import SuperAdminSuppliers from "./pages/superadmin/SuperAdminSuppliers";
import SuperAdminRequestOrder from "./pages/superadmin/SuperAdminRequestOrder";
import SuperAdminCustomerOrder from "./pages/superadmin/SuperAdminCustomerOrder";
import SuperAdminSupplierOrder from "./pages/superadmin/SuperAdminSupplierOrder";
import SuperAdminCustomerDelivery from "./pages/superadmin/SuperAdminCustomerDelivery";
import SuperAdminSupplierDelivery from "./pages/superadmin/SuperAdminSupplierDelivery";
import SuperAdminProducts from "./pages/superadmin/SuperAdminProducts";
import SuperAdminPriceHistory from "./pages/superadmin/SuperAdminPriceHistory";
import SuperAdminSales from "./pages/superadmin/SuperAdminSales";
import SuperAdminReturns from "./pages/superadmin/SuperAdminReturns";
import SuperAdminLogs from "./pages/superadmin/SuperAdminLogs";
import SuperAdminCategories from "./pages/superadmin/SuperAdminCategories";
import SuperAdminProfile from "./pages/superadmin/SuperAdminProfile";
import SuperAdminNotification from "./pages/superadmin/SuperAdminNotification";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffRequestOrder from "./pages/staff/StaffRequestOrder";
import StaffCustomerOrder from "./pages/staff/StaffCustomerOrder";
import StaffCustomerDelivery from "./pages/staff/StaffCustomerDelivery";
import StaffSupplierDelivery from "./pages/staff/StaffSupplierDelivery";
import StaffProducts from "./pages/staff/StaffProducts";
import StaffInventory from "./pages/staff/StaffInventory";
import StaffCustomers from "./pages/staff/StaffCustomers";
import StaffReturns from "./pages/staff/StaffReturns";
import StaffReports from "./pages/staff/StaffReports";
import StaffNotification from "./pages/staff/StaffNotification";
import StaffCategories from "./pages/staff/StaffCategories";

import NotFoundPage from "./pages/NotFoundPage";

// Toast notification utility
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
  custom: (message) => toast(message)
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
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/profile" element={<SuperAdminProfile />} />
            <Route path="/superadmin/users" element={<SuperAdminUsers />} />
            <Route path="/superadmin/customers" element={<SuperAdminCustomers />} />
            <Route path="/superadmin/inventory" element={<SuperAdminInventory />} />
            <Route path="/superadmin/reports" element={<SuperAdminReports />} />
            <Route path="/superadmin/suppliers" element={<SuperAdminSuppliers />} />
            <Route path="/superadmin/request-order" element={<SuperAdminRequestOrder />} />
            <Route path="/superadmin/customer-order" element={<SuperAdminCustomerOrder />} />
            <Route path="/superadmin/purchase-order" element={<SuperAdminSupplierOrder />} />
            <Route path="/superadmin/customer-delivery" element={<SuperAdminCustomerDelivery />} />
            <Route path="/superadmin/supplier-delivery" element={<SuperAdminSupplierDelivery />} />
            <Route path="/superadmin/products" element={<SuperAdminProducts />} />
            <Route path="/superadmin/price-history" element={<SuperAdminPriceHistory />} />
            <Route path="/superadmin/sales" element={<SuperAdminSales />} />
            <Route path="/superadmin/returns" element={<SuperAdminReturns />} />
            <Route path="/superadmin/logs" element={<SuperAdminLogs />} />
            <Route path="/superadmin/categories" element={<SuperAdminCategories />} />
            <Route path="/superadmin/notifications" element={<SuperAdminNotification />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/suppliers" element={<AdminSuppliers />} />
            <Route path="/admin/request-order" element={<AdminRequestOrder />} />
            <Route path="/admin/customer-order" element={<AdminCustomerOrder />} />
            <Route path="/admin/purchase-order" element={<AdminSupplierOrder />} />
            <Route path="/admin/customer-delivery" element={<AdminCustomerDelivery />} />
            <Route path="/admin/supplier-delivery" element={<AdminSupplierDelivery />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/price-history" element={<AdminPriceHistory />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/returns" element={<AdminReturns />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/notifications" element={<AdminNotification />} />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/request-order" element={<StaffRequestOrder />} />
            <Route path="/staff/customer-order" element={<StaffCustomerOrder />} />
            <Route path="/staff/customer-delivery" element={<StaffCustomerDelivery />} />
            <Route path="/staff/supplier-delivery" element={<StaffSupplierDelivery />} />
            <Route path="/staff/products" element={<StaffProducts />} />
            <Route path="/staff/inventory" element={<StaffInventory />} />
            <Route path="/staff/customers" element={<StaffCustomers />} />
            <Route path="/staff/returns" element={<StaffReturns />} />
            <Route path="/staff/reports" element={<StaffReports />} />
            <Route path="/staff/categories" element={<StaffCategories />} />
            <Route path="/staff/notifications" element={<StaffNotification />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Toast Container */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
