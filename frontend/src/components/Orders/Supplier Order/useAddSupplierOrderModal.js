//  ./useAddSupplierOrderModal.js
import { useState } from "react";

export const useAddSupplierOrderModal = (onSave, onClose) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const openModal = ({ isUpdate, existingOrderData = null }) => {
    setIsUpdate(isUpdate);
    setOrderData(existingOrderData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onClose();
  };

  const saveOrder = async (data) => {
    try {
      await onSave(data);
    } finally {
      closeModal();
    }
  };

  return {
    isModalOpen,
    isUpdate,
    orderData,
    openModal,
    closeModal,
    saveOrder,
  };
};
