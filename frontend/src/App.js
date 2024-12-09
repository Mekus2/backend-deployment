// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/profile" element={<SuperAdminProfile />} />
            <Route path="/admin/users" element={<SuperAdminUsers />} />
            <Route path="/admin/customers" element={<SuperAdminCustomers />} />
            <Route path="/admin/inventory" element={<SuperAdminInventory />} />
            <Route path="/admin/reports" element={<SuperAdminReports />} />
            <Route path="/admin/suppliers" element={<SuperAdminSuppliers />} />
            <Route
              path="/admin/request-order"
              element={<SuperAdminRequestOrder />}
            />
            <Route
              path="/admin/customer-order"
              element={<SuperAdminCustomerOrder />}
            />
            <Route
              path="/admin/purchase-order"
              element={<SuperAdminSupplierOrder />}
            />
            <Route
              path="/admin/customer-delivery"
              element={<SuperAdminCustomerDelivery />}
            />
            <Route
              path="/admin/supplier-delivery"
              element={<SuperAdminSupplierDelivery />}
            />
            <Route path="/admin/products" element={<SuperAdminProducts />} />
            <Route
              path="/admin/price-history"
              element={<SuperAdminPriceHistory />}
            />
            <Route path="/admin/sales" element={<SuperAdminSales />} />
            <Route path="/admin/issues" element={<SuperAdminReturns />} />
            <Route path="/admin/logs" element={<SuperAdminLogs />} />
            <Route
              path="/admin/categories"
              element={<SuperAdminCategories />}
            />
            <Route
              path="/admin/notifications"
              element={<SuperAdminNotification />}
            />

            {/* Admin Routes */}
            <Route path="/staff/dashboard" element={<AdminDashboard />} />
            <Route path="/staff/profile" element={<AdminProfile />} />
            <Route path="/staff/users" element={<AdminUsers />} />
            <Route path="/staff/customers" element={<AdminCustomers />} />
            <Route path="/staff/inventory" element={<AdminInventory />} />
            <Route path="/staff/reports" element={<AdminReports />} />
            <Route path="/staff/suppliers" element={<AdminSuppliers />} />
            <Route
              path="/staff/request-order"
              element={<AdminRequestOrder />}
            />
            <Route
              path="/staff/customer-order"
              element={<AdminCustomerOrder />}
            />
            <Route
              path="/staff/purchase-order"
              element={<AdminSupplierOrder />}
            />
            <Route
              path="/staff/customer-delivery"
              element={<AdminCustomerDelivery />}
            />
            <Route
              path="/staff/supplier-delivery"
              element={<AdminSupplierDelivery />}
            />
            <Route path="/staff/products" element={<AdminProducts />} />
            <Route
              path="/staff/price-history"
              element={<AdminPriceHistory />}
            />
            <Route path="/staff/sales" element={<AdminSales />} />
            <Route path="/staff/issues" element={<AdminReturns />} />
            <Route path="/staff/logs" element={<AdminLogs />} />
            <Route path="/staff/categories" element={<AdminCategories />} />
            <Route
              path="/staff/notifications"
              element={<AdminNotification />}
            />

            {/* Staff Routes */}
            <Route path="/prevstaff/dashboard" element={<StaffDashboard />} />
            <Route path="/prevstaff/profile" element={<StaffProfile />} />
            <Route
              path="/prevstaff/request-order"
              element={<StaffRequestOrder />}
            />
            <Route
              path="/prevstaff/customer-order"
              element={<StaffCustomerOrder />}
            />
            <Route
              path="/prevstaff/customer-delivery"
              element={<StaffCustomerDelivery />}
            />
            <Route
              path="/prevstaff/supplier-delivery"
              element={<StaffSupplierDelivery />}
            />
            <Route path="/prevstaff/products" element={<StaffProducts />} />
            <Route path="/prevstaff/inventory" element={<StaffInventory />} />
            <Route path="/prevstaff/customers" element={<StaffCustomers />} />
            <Route path="/prevstaff/issues" element={<StaffReturns />} />
            <Route path="/prevstaff/reports" element={<StaffReports />} />
            <Route path="/prevstaff/categories" element={<StaffCategories />} />
            <Route
              path="/prevstaff/notifications"
              element={<StaffNotification />}
            />

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
