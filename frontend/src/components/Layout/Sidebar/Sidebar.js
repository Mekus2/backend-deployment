import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, NavLink, useNavigate } from "react-router-dom"; // Import useNavigate
import { TbChevronDown } from "react-icons/tb";
import philvetsLogo from "../../../assets/philvets.png";
import {
  adminSidebarItems,
  staffSidebarItems,
  superadminSidebarItems,
} from "./sidebarItems"; // Imported superadmin items
import { TbLogout2 } from "react-icons/tb";

// Centralized theme object for colors (move this if it's defined elsewhere)
const theme = {
  text: "#000000", // Default text color
  textActive: "#FFFFFF", // Text color when active
  backgroundActive: "#00C4FF", // Background color when active
  backgroundHover: "#00C4FF", // Background color on hover
  primary: "#00C4FF", // Primary background color (for active state)
  background: "#FFFFFF", // Background color (for active state)
};

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate(); // Initialize navigate
  const sidebarRef = useRef(null);
  const location = useLocation(); // Get the current location
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Determine sidebar items based on userRole and location
  const getSidebarItems = () => {
    if (location.pathname.startsWith("/superadmin")) {
      return superadminSidebarItems;
    } else if (location.pathname.startsWith("/admin")) {
      return adminSidebarItems;
    } else {
      return staffSidebarItems;
    }
  };

  const sidebarItems = getSidebarItems();

  // Ensure dropdown remains open if any of its subItems matches the current route
  useEffect(() => {
    const matchingDropdown = sidebarItems.findIndex((item) =>
      item.dropdown?.some((subItem) => subItem.link === location.pathname)
    );
    if (matchingDropdown !== -1) {
      setOpenDropdown(matchingDropdown);
    }
  }, [location, sidebarItems]);

  // Only toggle the dropdown when the button is clicked
  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index); // Toggle only on click
  };

  const handleSignOut = () => {
    // Clear access token and any other user-related data from localStorage
    localStorage.removeItem("access_tokenStorage");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_first_name");
    localStorage.removeItem("user_type"); // Clear any other stored user info

    console.log("User signed out. Tokens cleared."); // Logs the sign-out action
    navigate("/login"); // Redirect to the login page
  };

  return (
    <SidebarContainer ref={sidebarRef} isOpen={isOpen}>
      <SidebarHeader>
        <LogoContainer>
          <Logo src={philvetsLogo} alt="PHILVETS Logo" />
        </LogoContainer>
      </SidebarHeader>

      <SidebarContent>
        {sidebarItems.map((item, index) => {
          const isParentActive = item.dropdown && openDropdown === index; // Dropdown open state

          return (
            <React.Fragment key={index}>
              <SidebarLink
                as={item.dropdown ? "div" : NavLink} // Use div for parent dropdown items
                to={item.dropdown ? "#" : item.link}
                className={
                  !item.dropdown && location.pathname === item.link
                    ? "active"
                    : ""
                }
                onClick={() => {
                  if (item.dropdown) {
                    handleDropdownToggle(index); // Toggle dropdown
                  }
                }}
                active={isParentActive} // Parent item active state is based on dropdown open
              >
                <item.icon size={20} className="icon" />
                <span className="label">{item.label}</span>
                {item.dropdown && (
                  <ChevronIconContainer isOpen={isParentActive}>
                    <TbChevronDown size={16} className="arrow-icon" />
                  </ChevronIconContainer>
                )}
              </SidebarLink>

              {item.dropdown && isParentActive && (
                <DropdownContainer>
                  {item.dropdown.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.link}
                      className={({ isActive }) =>
                        `dropdown-item ${isActive ? "active" : ""}`
                      }
                    >
                      {subItem.icon && (
                        <subItem.icon size={15} className="icon" />
                      )}
                      <span className="dropdown-label">{subItem.label}</span>
                    </NavLink>
                  ))}
                </DropdownContainer>
              )}
            </React.Fragment>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarLink to="/login">
          <TbLogout2 size={20} className="icon" />
          <span className="label" onClick={handleSignOut}>Logout</span>
        </SidebarLink>
      </SidebarFooter>
    </SidebarContainer>
  );
};

// Styled Components (make sure 'theme' is in scope)
const SidebarContainer = styled.div`
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  background-color: white;
  color: black;
  max-width: 190px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    transform: ${({ isOpen }) =>
      isOpen ? "translateX(0)" : "translateX(-100%)"};
    z-index: 1000;
    box-shadow: ${({ isOpen }) =>
      isOpen ? "2px 0 5px rgba(0, 0, 0, 0.5)" : "none"};
  }

  @media (min-width: 769px) {
    position: static;
    transform: translateX(0);
  }

  top: 0;
  left: 0;
  height: 100%;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  max-width: 90%;
  height: auto;
  padding: 5px 15px 0px 20px;
  margin-left: 6px;
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
`;

const SidebarFooter = styled.div`
  padding: 16px;
`;

const SidebarLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 6px;
  margin-bottom: 4px;
  border-radius: 4px;
  color: ${({ active }) => (active ? theme.textActive : theme.text)};
  text-decoration: none;
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  /* Ensure the background and text color of active dropdown parent item */
  ${({ active }) =>
    active &&
    `
      background-color: ${theme.primary};
      color: ${theme.background};
      
      .icon {
        color: ${theme.background};
      }
  `}

  &:hover {
    background-color: ${theme.backgroundHover};
    color: ${theme.background};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    .icon {
      color: ${theme.background};
    }
  }

  &.active {
    background-color: ${theme.primary};
    color: ${theme.background};

    .icon {
      color: ${theme.background};
    }
  }

  .icon {
    width: 20px;
    height: 20px;
    color: inherit;
    transition: color 0.1s ease-in-out;
  }

  .label {
    margin-left: 8px;
    font-size: 15px;
    transition: color 0.1s ease-in-out;
  }
`;

const ChevronIconContainer = styled.div`
  margin-left: auto;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.3s ease-in-out;
`;

const DropdownContainer = styled.div`
  padding: 2px; /* Indent dropdown items */
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-left: 10px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 4px;
    border-radius: 4px;
    color: ${theme.text}; /* Keep text color black for dropdown items */
    text-decoration: none;
    transition: background-color 0.1s ease-in-out;

    &.active {
      background-color: ${theme.primary}; /* Change background when active */
      color: ${theme.background}; /* Keep text white */
    }

    &:hover {
      background-color: ${theme.backgroundHover};
      color: ${theme.background};
    }

    .icon {
      margin-right: 8px;
      width: 15px;
      height: 15px;
    }

    .dropdown-label {
      font-size: 14px;
    }
  }
`;

export default Sidebar;
