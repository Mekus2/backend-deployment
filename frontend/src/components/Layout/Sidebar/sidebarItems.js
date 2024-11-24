// src/components/sidebaritems.js

import {
  TbLayoutDashboard,
  TbTruckDelivery,
  TbChevronRight,
  TbUserDollar,
  TbBasketDollar,
  TbTruckReturn,
  TbHistory,
  TbFileReport,
} from "react-icons/tb";
import { MdOutlineInventory2, MdOutlineShoppingCart } from "react-icons/md";
import { LuWarehouse, LuBox } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";

// Sidebar Items for SuperAdmin
export const superadminSidebarItems = [
  {
    icon: TbLayoutDashboard,
    label: "Dashboard",
    link: "/superadmin/dashboard",
  },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Request",
        link: "/superadmin/request-order",
      },
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/superadmin/customer-order",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/superadmin/purchase-order",
      },
    ],
  },
  {
    icon: TbTruckDelivery,
    label: "Delivery",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/superadmin/customer-delivery",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/superadmin/supplier-delivery",
      },
    ],
  },
  {
    icon: LuBox,
    label: "Product",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Product",
        link: "/superadmin/products",
      },
      {
        icon: TbChevronRight,
        label: "Inventory",
        link: "/superadmin/inventory",
      },
      {
        icon: TbChevronRight,
        label: "Categories",
        link: "/superadmin/categories",
      },
      {
        icon: TbChevronRight,
        label: "Price History",
        link: "/superadmin/price-history",
      },
    ],
  },

  {
    icon: GrGroup,
    label: "Management",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/superadmin/customers",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/superadmin/suppliers",
      },
      {
        icon: TbChevronRight,
        label: "User",
        link: "/superadmin/users",
      },
    ],
  },
  { icon: TbTruckReturn, label: "Return", link: "/superadmin/returns" },
  { icon: TbBasketDollar, label: "Sales", link: "/superadmin/sales" },
  { icon: TbHistory, label: "Logs", link: "/superadmin/logs" },
  { icon: TbFileReport, label: "Report", link: "/superadmin/reports" },
];

// Sidebar Items for Admin
export const adminSidebarItems = [
  { icon: TbLayoutDashboard, label: "Dashboard", link: "/admin/dashboard" },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Requests",
        link: "/admin/request-order",
      },
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/admin/customer-order",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/admin/purchase-order",
      },
    ],
  },
  {
    icon: TbTruckDelivery,
    label: "Delivery",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/admin/customer-delivery",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/admin/supplier-delivery",
      },
    ],
  },
  {
    icon: LuBox,
    label: "Product",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Product",
        link: "/admin/products",
      },
      {
        icon: TbChevronRight,
        label: "Inventory",
        link: "/admin/inventory",
      },
      {
        icon: TbChevronRight,
        label: "Categories",
        link: "/admin/categories",
      },
      {
        icon: TbChevronRight,
        label: "Price History",
        link: "/admin/price-history",
      },
    ],
  },

  {
    icon: GrGroup,
    label: "Management",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/admin/customers",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/admin/suppliers",
      },
      {
        icon: TbChevronRight,
        label: "Staff",
        link: "/admin/users",
      },
    ],
  },
  { icon: TbTruckReturn, label: "Return", link: "/admin/returns" },
  { icon: TbHistory, label: "Logs", link: "/admin/logs" },
  { icon: TbFileReport, label: "Report", link: "/admin/reports" },
];

// Sidebar Items for Staff
export const staffSidebarItems = [
  { icon: TbLayoutDashboard, label: "Dashboard", link: "/staff/dashboard" },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Request",
        link: "/staff/request-order",
      },
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/staff/customer-order",
      },
    ],
  },
  {
    icon: TbTruckDelivery,
    label: "Delivery",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/staff/customer-delivery",
      },
    ],
  },
  {
    icon: LuBox,
    label: "Product",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Product",
        link: "/staff/products",
      },
      {
        icon: TbChevronRight,
        label: "Categories",
        link: "/staff/categories",
      },
    ],
  },
  { icon: MdOutlineInventory2, label: "Inventory", link: "/staff/inventory" },
  { icon: TbUserDollar, label: "Customer", link: "/staff/customers" },
  { icon: TbTruckReturn, label: "Return", link: "/staff/returns" },
  { icon: TbFileReport, label: "Report", link: "/staff/reports" },
];
