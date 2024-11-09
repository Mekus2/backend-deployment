// src/components/CardsData/CardTotalUsers.js

import React from "react";
import Card from "../Layout/Card";
import { USER } from "../../data/UserData"; // Import the USER data
import styled from "styled-components";
import { FaUserTie } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalUsers = () => {
  // Calculate the total number of Admin and Staff users only
  const totalUsers = USER.filter(
    (user) => user.USER_ACCTTYPE === "Admin" || user.USER_ACCTTYPE === "Staff"
  ).length;

  return (
    <CardContainer>
      <Card
        label="Users"
        value={totalUsers} // Display the total number of Admin and Staff users
        icon={<FaUserTie />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalUsers;
