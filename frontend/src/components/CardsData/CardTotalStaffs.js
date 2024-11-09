// src/components/CardsData/CardTotalStaffs.js

import React from "react";
import Card from "../Layout/Card";
import { USER } from "../../data/UserData"; // Import the users data
import styled from "styled-components";
import { FaUserTie } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalStaffs = () => {
  // Filter the users to get only those with the account type "Staff"
  const totalStaff = USER.filter(user => user.USER_ACCTTYPE === "Staff").length;

  return (
    <CardContainer>
      <Card
        label="Staff"
        value={totalStaff} // Display the total number of staff
        icon={<FaUserTie />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalStaffs;
