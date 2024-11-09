// src/components/Header.js

import React, { useState } from "react";
import { TbUserCircle } from "react-icons/tb";
import { FaBars } from "react-icons/fa";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../colors";
import BellNotif from "../Notifications/BellNotif"; // Import the new BellNotif component

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/request-order": "Request Orders",
  "/admin/customer-order": "Customer Orders",
  "/admin/purchase-order": "Supplier Orders",
  "/admin/customer-delivery": "Customer Deliveries",
  "/admin/supplier-delivery": "Supplier Deliveries",
  "/admin/products": "Products",
  "/admin/price-history": "Price History",
  "/admin/categories": "Categories",
  "/admin/inventory": "Inventory",
  "/admin/suppliers": "Suppliers",
  "/admin/customers": "Customers",
  "/admin/users": "Staffs",
  "/admin/sales": "Sales",
  "/admin/returns": "Returns",
  "/admin/logs": "Logs",
  "/admin/reports": "Reports",
  "/admin/profile": "Profile",
  "/admin/notifications": "Notifications",

  "/superadmin/dashboard": "Dashboard",
  "/superadmin/request-order": "Request Orders",
  "/superadmin/customer-order": "Customer Orders",
  "/superadmin/purchase-order": "Supplier Orders",
  "/superadmin/customer-delivery": "Customer Deliveries",
  "/superadmin/supplier-delivery": "Supplier Deliveries",
  "/superadmin/products": "Products",
  "/superadmin/price-history": "Price History",
  "/superadmin/categories": "Categories",
  "/superadmin/inventory": "Inventory",
  "/superadmin/suppliers": "Suppliers",
  "/superadmin/customers": "Customers",
  "/superadmin/users": "Users",
  "/superadmin/sales": "Sales",
  "/superadmin/returns": "Returns",
  "/superadmin/logs": "Logs",
  "/superadmin/reports": "Reports",
  "/superadmin/profile": "SuperAdmin Profile",
  "/superadmin/notifications": "Notifications",

  "/staff/dashboard": "Dashboard",
  "/staff/profile": "Staff Profile",
  "/staff/request-order": "Request Orders",
  "/staff/customer-order": "Customer Orders",
  "/staff/customer-delivery": "Customer Deliveries",
  "/staff/products": "Products",
  "/staff/categories": "Categories",
  "/staff/inventory": "Inventory",
  "/staff/customers": "Customers",
  "/staff/reports": "Reports",
  "/staff/returns": "Returns",
  "/staff/notifications": "Notifications",
};

const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = pageTitles[location.pathname] || "Page Title";

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const goToProfile = () => {
    if (location.pathname.startsWith("/admin")) {
      navigate("/admin/profile");
    } else if (location.pathname.startsWith("/staff")) {
      navigate("/staff/profile");
    } else if (location.pathname.startsWith("/superadmin")) {
      navigate("/superadmin/profile");
    }
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <HeaderContainer>
      <HamburgerMenu onClick={toggleSidebar} />
      <PageTitle>{pageTitle}</PageTitle>
      <RightSection>
        <BellNotif />
        <ProfileContainer
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ProfileButton
            className={location.pathname.includes("/profile") ? "active" : ""}
            onClick={goToProfile}
          >
            <span>
              {location.pathname.startsWith("/admin")
                ? "Admin"
                : location.pathname.startsWith("/superadmin")
                ? "SuperAdmin"
                : "Staff"}
            </span>
            <TbUserCircle className="h-5 w-5 ml-1" />
          </ProfileButton>
          {isDropdownOpen && (
            <DropdownContent
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <DropdownItem onClick={goToProfile}>Profile</DropdownItem>
              <DropdownItem onClick={handleSignOut}>Sign out</DropdownItem>
            </DropdownContent>
          )}
        </ProfileContainer>
      </RightSection>
    </HeaderContainer>
  );
};

// Styled components (unchanged from previous)
const HeaderContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  color: black;
  padding: 8px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const HamburgerMenu = styled(FaBars)`
  font-size: 20px;
  margin-right: 9px;
  cursor: pointer;
  display: none;

  &:hover {
    color: ${colors.primary};
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  background: transparent;
  color: black;
  font-weight: 600;
  padding: 5px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  margin-left: 10px;

  svg {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }

  &.active {
    background-color: ${colors.primary};
    color: white;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  right: 0;
  width: 100px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const DropdownItem = styled.div`
  display: block;
  padding: 8px 16px;
  font-size: 12px;
  color: black;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: ${colors.primary};
    color: white;
  }
`;

export default Header;
