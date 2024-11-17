import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import AddUserModal from "../../components/Users/AddUserModal";
import UserDetailsModal from "../../components/Users/UserDetailsModal";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Button from "../../components/Layout/Button";
import Card from "../../components/Layout/Card"; // Import the new Card component
import { FaPlus } from "react-icons/fa";
import { fetchTotalStaff, fetchStaff } from "../../api/StaffApi";
import axios from "axios";
import profilePic from "../../assets/profile.png";

const SharedUsersPage = () => {
  const [userType, setUserType] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    const storedUserType = localStorage.getItem("user_type");
    setUserType(storedUserType);

    fetchTotalStaff()
      .then((data) => setTotalStaff(data.total))
      .catch((error) => console.error(error));

    fetchStaff()
      .then((data) => {
        setStaffData(data);
        const fetchImages = async () => {
          const newImageUrls = {};
          for (const member of data) {
            try {
              const imageResponse = await axios.get(
                `http://127.0.0.1:8000/account/users/${member.id}/image/`
              );
              const imageUrl = imageResponse.data.image_url;
              newImageUrls[member.id] = imageUrl || profilePic;
            } catch (error) {
              console.error("Failed to fetch image for user:", member.id);
              newImageUrls[member.id] = profilePic;
            }
          }
          setImageUrls(newImageUrls);
        };

        fetchImages();
      })
      .catch((error) => console.error(error));
  }, []);

  const filteredStaff = staffData.filter((member) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const isActiveFilter = showInactive
      ? member.USER_ISACTIVE
      : !member.USER_ISACTIVE;

    return (
      isActiveFilter &&
      (member.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.accType.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.username.toLowerCase().includes(lowerCaseSearchTerm))
    );
  });

  const handleAddUser = (newUser) => {
    setStaffData((prevData) => [...prevData, newUser]);
  };

  const handleActivateDeactivateUser = (id) => {
    setStaffData((prevData) =>
      prevData.map((member) =>
        member.id === id
          ? { ...member, USER_ISACTIVE: !member.USER_ISACTIVE }
          : member
      )
    );
  };

  const openDetailsModal = async (user) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/account/users/${user.id}/`
      );
      console.log("API Response:", response.data);
      setSelectedUser(response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const headers = ["Image", "Name", "Role", "Actions"];

  const rows = filteredStaff.map((member) => [
    <ImageContainer key={member.id}>
      <img
        src={imageUrls[member.id]}
        alt={`${member.first_name} ${member.last_name}`}
        width="50"
        height="50"
      />
    </ImageContainer>,
    `${member.first_name} ${member.last_name}`,
    member.accType,
    <Button
      backgroundColor={colors.primary}
      hoverColor={colors.primaryHover}
      onClick={() => openDetailsModal(member)}
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
        {(userType === "admin" || userType === "superadmin") && (
          <Card
            label="Users"
            value={`${filteredStaff.length}`}
            bgColor={colors.primary}
            icon={<FaPlus />}
          />
        )}
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}
      {isDetailsModalOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setIsDetailsModalOpen(false)}
          onRemove={() => handleActivateDeactivateUser(selectedUser.id)}
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

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
`;

export default SharedUsersPage;
