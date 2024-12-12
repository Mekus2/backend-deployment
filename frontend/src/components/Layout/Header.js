import React, { useState } from "react";
import { TbUserCircle } from "react-icons/tb";
import { FaRegBell, FaBars } from "react-icons/fa";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../colors";

// Updated pageTitles with superadmin and other role titles
const pageTitles = {
  // Admin routes
  "/staff/dashboard": "Dashboard",
  "/staff/orders": "Order",
  "/staff/customer-order": "Customer Order",
  "/staff/purchase-order": "Supplier Order",
  "/staff/customer-delivery": "Customer Delivery",
  "/staff/supplier-delivery": "Supplier Delivery",
  "/staff/issues": "Issue",
  "/staff/products": "Product",
  "/staff/inventory": "Inventory",
  "/staff/price-history": "Price History",
  "/staff/customers": "Customer",
  "/staff/suppliers": "Supplier",
  "/staff/users": "PrevStaff",
  "/staff/logs": "Logs",
  "/staff/reports": "Reports",
  "/staff/profile": "Profile",
  "/staff/notifications": "Notifications",

  // SuperAdmin routes
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Order",
  "/admin/customer-order": "Customer Order",
  "/admin/purchase-order": "Supplier Order",
  "/admin/customer-delivery": "Customer Delivery",
  "/admin/supplier-delivery": "Supplier Delivery",
  "/admin/issues": "Issue",
  "/admin/products": "Product",
  "/admin/inventory": "Inventory",
  "/admin/price-history": "Price History",
  "/admin/customers": "Customer",
  "/admin/suppliers": "Supplier",
  "/admin/users": "User",
  "/admin/sales": "Sales",
  "/admin/logs": "Logs",
  "/admin/reports": "Reports",
  "/admin/profile": "Admin Profile",
  "/admin/notifications": "Notifications",
  "/admin/daily-reports": "Daily Report",
  "/admin/expiration-reports": "Expiration Report",
  "/admin/stock-reports": "Stocks Report",

  // Staff routes
  "/prevstaff/dashboard": "Dashboard",
  "/prevstaff/customer-order": "Customer Order",
  "/prevstaff/customer-delivery": "Customer Delivery",
  "/prevstaff/issues": "Issue",
  "/prevstaff/products": "Product",
  "/prevstaff/inventory": "Inventory",
  "/prevstaff/customers": "Customers",
  "/prevstaff/profile": "Staff Profile",
  "/prevstaff/notifications": "Notifications",
};

const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = pageTitles[location.pathname] || "Main Page";

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
    }
  };

  const goToNotifications = () => {
    if (location.pathname.startsWith("/admin")) {
      navigate("/staff/notifications");
    } else if (location.pathname.startsWith("/staff")) {
      navigate("/prevstaff/notifications");
    } else if (location.pathname.startsWith("/superadmin")) {
      navigate("/admin/notifications");
    }
  };

  const handleSignOut = () => {
    // Clear access token and any other user-related data from localStorage
    localStorage.removeItem("access_tokenStorage");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_first_name");
    localStorage.removeItem("user_type");

    console.log("User signed out. Tokens cleared.");
    navigate("/login");
  };

  return (
    <HeaderContainer>
      <HamburgerMenu onClick={toggleSidebar} />
      <PageTitle>{pageTitle}</PageTitle>
      <RightSection>
        {/* <BellIcon
          className={
            location.pathname.includes("/notifications") ? "active" : ""
          }
          onClick={goToNotifications}
        /> */}
        <ProfileContainer
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ProfileButton
            className={location.pathname.includes("/profile") ? "active" : ""}
            onClick={goToProfile}
          >
            <span>
              {location.pathname.startsWith("/staff")
                ? "Staff"
                : location.pathname.startsWith("/admin")
                ? "Admin"
                : "PrevStaff"}
            </span>
            <TbUserCircle className="h-5 w-5 ml-1" />
          </ProfileButton>
          {/* {isDropdownOpen && (
            <DropdownContent
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <DropdownItem onClick={goToProfile}>Profile</DropdownItem>
              <DropdownItem onClick={handleSignOut}>Sign out</DropdownItem>
            </DropdownContent>
          )} */}
        </ProfileContainer>
      </RightSection>
    </HeaderContainer>
  );
};

// Styled components
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

const BellIcon = styled(FaRegBell)`
  font-size: 30px;
  margin-right: -5px;
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  padding: 4px;
  color: black;

  &.active {
    background-color: ${colors.primary};
    color: white;
  }
`;

export default Header;
