import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { USER as initialUser } from "../../data/UserData";
import AddUserModal from "../../components/Users/AddUserModal";
import UserDetailsModal from "../../components/Users/UserDetailsModal";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalUsers from "../../components/CardsData/CardTotalUsers"; // Card for SuperAdmin
import CardTotalStaffs from "../../components/CardsData/CardTotalStaffs"; // Card for Admin
import Button from "../../components/Layout/Button";
import { FaPlus } from "react-icons/fa";

const SharedUsersPage = ({ userType }) => {
  const [USER, setUser] = useState(initialUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const filteredUser = USER.filter((member) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const isActiveFilter = showInactive
      ? !member.USER_ISACTIVE
      : member.USER_ISACTIVE;

    // Filter based on userType passed as prop
    const isStaffOrAdmin =
      userType === "admin"
        ? member.USER_ACCTTYPE === "Staff" // Only show Staff for Admin
        : member.USER_ACCTTYPE === "Staff" || member.USER_ACCTTYPE === "Admin"; // Show both Staff and Admin for SuperAdmin

    return (
      isActiveFilter &&
      isStaffOrAdmin &&
      (
        member.USER_FIRSTNAME.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.USER_LASTNAME.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.USER_EMAIL.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.USER_USERNAME.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.image.toLowerCase().includes(lowerCaseSearchTerm) // Optionally, include image URL in search
      )
    );
  });

  const handleAddUser = (newUser) => {
    setUser((prevUser) => [...prevUser, newUser]);
  };

  const handleActivateDeactivateUser = (email) => {
    setUser((prevUser) =>
      prevUser.map((member) =>
        member.USER_EMAIL === email
          ? {
              ...member,
              USER_ISACTIVE: !member.USER_ISACTIVE,
            }
          : member
      )
    );
  };

  const headers = ["Image", "Name", "Email", "Username", "Actions"];

  const rows = filteredUser.map((member) => [
    <ImageContainer key={member.USER_EMAIL}>
      <img
        src={member.image}
        alt={`${member.USER_FIRSTNAME} ${member.USER_LASTNAME}`}
        width="50"
      />
    </ImageContainer>,
    `${member.USER_FIRSTNAME} ${member.USER_LASTNAME}`,
    member.USER_EMAIL,
    member.USER_USERNAME,
    <Button
      backgroundColor={colors.primary}
      hoverColor={colors.primaryHover}
      onClick={() => {
        setIsDetailsModalOpen(true);
        setSelectedUser(member);
      }}
    >
      Details
    </Button>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder={`Search / Filter ${
            userType === "admin" ? "staff..." : "users..."
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <StyledButton
            backgroundColor={colors.primary}
            hoverColor={colors.primaryHover}
            onClick={() => setIsAddModalOpen(true)}
          >
            <FaPlus className="icon" /> User
          </StyledButton>
          <Button
            backgroundColor={showInactive ? colors.green : colors.red}
            hoverColor={showInactive ? colors.greenHover : colors.redHover}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Show Active" : "Show Inactive"}
          </Button>
        </ButtonGroup>
      </Controls>
      <AnalyticsContainer>
        {userType === "admin" ? <CardTotalStaffs /> : <CardTotalUsers />}
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}
      {isDetailsModalOpen && (
        <UserDetailsModal
          client={selectedUser}
          onClose={() => setIsDetailsModalOpen(false)}
          onRemove={() => {
            handleActivateDeactivateUser(selectedUser.USER_EMAIL);
          }}
        />
      )}
    </>
  );
};

// Styled Components

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center; /* Center the image horizontally */
  align-items: center; /* Center the image vertically */
  height: 50px; /* Set height to match the image size */
`;

export default SharedUsersPage;
