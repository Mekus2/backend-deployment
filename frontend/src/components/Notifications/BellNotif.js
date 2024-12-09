import React from "react";
import { FaRegBell } from "react-icons/fa";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../colors";
import { useNotification } from "../../context/NotificationContext";

const BellNotif = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotification(); // Access unread count

  const goToNotifications = () => {
    if (location.pathname.startsWith("/admin")) {
      navigate("/staff/notifications");
    } else if (location.pathname.startsWith("/staff")) {
      navigate("/prevstaff/notifications");
    } else if (location.pathname.startsWith("/superadmin")) {
      navigate("/admin/notifications");
    }
  };

  return (
    <BellIcon
      className={location.pathname.includes("/notifications") ? "active" : ""}
      onClick={goToNotifications}
    >
      <FaRegBell />
      {/* Conditionally render the notification badge */}
      {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
    </BellIcon>
  );
};

// Styled components
const BellIcon = styled.div`
  font-size: 30px;
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  padding: 4px;
  color: black;
  position: relative;

  &.active {
    background-color: ${colors.primary};
    color: white;
  }

  i {
    font-size: inherit;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 1px;
  right: -3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: red;
  color: white;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
`;

export default BellNotif;
