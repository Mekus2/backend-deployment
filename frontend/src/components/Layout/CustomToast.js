// CustomToast.js
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Custom toast component
const CustomToast = ({ message, closeToast }) => (
  <div style={toastStyles.container}>
    <button style={toastStyles.closeButton} onClick={closeToast}>✖️</button>
    <div style={toastStyles.content}>{message}</div>
  </div>
);

// Custom notify function to trigger different types of toasts
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
  custom: (message) => toast(<CustomToast message={message} />),
};

// ToastContainer component to be included in App or main layout
export const ToastContainerSetup = () => (
  <ToastContainer
    position="top-right"
    autoClose={1000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    style={{ zIndex: 9999 }} // Ensures it appears on top of modals
  />
);

// Inline styles for the custom toast
const toastStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#333',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
      fontSize: '14px',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '1.2em',
      marginRight: '8px',
      cursor: 'pointer',
    },
    content: {
      flex: 1,
    }
  };
export default CustomToast;
