// src/components/sidebaritems.js

import {
  TbLayoutDashboard,
  TbTruckDelivery,
  TbUserDollar,
  TbBasketDollar,
  TbChevronRight,
  TbHistory,
  TbFileReport,
} from "react-icons/tb";
import { MdOutlineInventory2, MdOutlineShoppingCart } from "react-icons/md";
import { LuBox } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";

// Sidebar Items for SuperAdmin
export const adminSidebarItems = [
  {
    icon: TbLayoutDashboard,
    label: "Dashboard",
    link: "/admin/dashboard",
  },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      // {
      //   icon: TbChevronRight,
      //   label: "Request",
      //   link: "/admin/request-order",
      // },
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
      { icon: TbChevronRight, label: "Issues", link: "/admin/issues" },
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
      // {
      //   icon: TbChevronRight,
      //   label: "Categories",
      //   link: "/admin/categories",
      // },
      // {
      //   icon: TbChevronRight,
      //   label: "Price History",
      //   link: "/admin/price-history",
      // },
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
        label: "User",
        link: "/admin/users",
      },
    ],
  },
  { icon: TbBasketDollar, label: "Sales", link: "/admin/sales" },
  { icon: TbHistory, label: "Logs", link: "/admin/logs" },
  { icon: TbFileReport, label: "Report", link: "/admin/reports" },
];

// Sidebar Items for Admin
export const staffSidebarItems = [
  { icon: TbLayoutDashboard, label: "Dashboard", link: "/staff/dashboard" },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      // {
      //   icon: TbChevronRight,
      //   label: "Requests",
      //   link: "/staff/request-order",
      // },
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/staff/customer-order",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/staff/purchase-order",
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
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/staff/supplier-delivery",
      },
      { icon: TbChevronRight, label: "Issues", link: "/staff/issues" },
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
        label: "Inventory",
        link: "/staff/inventory",
      },
      // {
      //   icon: TbChevronRight,
      //   label: "Categories",
      //   link: "/staff/categories",
      // },
      // {
      //   icon: TbChevronRight,
      //   label: "Price History",
      //   link: "/staff/price-history",
      // },
    ],
  },

  {
    icon: GrGroup,
    label: "Management",
    dropdown: [
      {
        icon: TbChevronRight,
        label: "Customer",
        link: "/staff/customers",
      },
      {
        icon: TbChevronRight,
        label: "Supplier",
        link: "/staff/suppliers",
      },
      // {
      //   icon: TbChevronRight,
      //   label: "PrevStaff",
      //   link: "/staff/users",
      // },
    ],
  },

  { icon: TbHistory, label: "Logs", link: "/staff/logs" },
  // { icon: TbFileReport, label: "Report", link: "/staff/reports" },
];

// Sidebar Items for Staff
export const prevstaffSidebarItems = [
  { icon: TbLayoutDashboard, label: "Dashboard", link: "/staff/dashboard" },
  {
    icon: MdOutlineShoppingCart,
    label: "Order",
    dropdown: [
      // {
      //   icon: TbChevronRight,
      //   label: "Request",
      //   link: "/staff/request-order",
      // },
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
      { icon: TbChevronRight, label: "Issues", link: "/staff/issues" },
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
      // {
      //   icon: TbChevronRight,
      //   label: "Categories",
      //   link: "/staff/categories",
      // },
      {
        icon: MdOutlineInventory2,
        label: "Inventory",
        link: "/staff/inventory",
      },
    ],
  },

  { icon: TbUserDollar, label: "Customer", link: "/staff/customers" },
  // { icon: TbFileReport, label: "Report", link: "/staff/reports" },
];
