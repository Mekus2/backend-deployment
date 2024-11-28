import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import AddUserModal from "../../components/Users/AddUserModal";
import UserDetailsModal from "../../components/Users/UserDetailsModal";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import Button from "../../components/Layout/Button";
import Card from "../../components/Layout/Card";
import { FaPlus, FaUsers } from "react-icons/fa";
import axios from "axios";
import profilePic from "../../assets/profile.png";
import Loading from "../../components/Layout/Loading"; // Add your Loading component

const SharedUsersPage = () => {
  const [userType, setUserType] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/account/users/?isactive=${!showInactive}`
      );
      const data = response.data;

      // Fetch user images
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
      setStaffData(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [showInactive]); // Re-fetch data when toggling active/inactive state

  useEffect(() => {
    const storedUserType = localStorage.getItem("user_type");
    setUserType(storedUserType);

    fetchUsers();
  }, [fetchUsers]); // Added fetchUsers to the dependency array

  const handleAddUser = (newUser) => {
    setStaffData((prevData) => [...prevData, newUser]);
  };

  const handleActivateDeactivateUser = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/account/users/${id}/`, {
        isActive: !showInactive, // Toggle the user's active state
      });
      fetchUsers(); // Refresh the data
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const openDetailsModal = async (user) => {
    try {
      // Fetch user details directly based on the user ID using the new URL
      const response = await axios.get(
        `http://127.0.0.1:8000/account/details/${user.id}/` // Updated URL for fetching user details
      );

      // Include the isActive field along with the other user details
      setSelectedUser({ ...response.data, isActive: user.isActive }); // Add isActive field to the selected user
      setIsDetailsModalOpen(true); // Open the details modal
    } catch (error) {
      console.error("Error fetching user data:", error); // Handle any errors that occur
    }
  };

  const headers = ["Image", "Name", "Role", "Actions"];

  const filteredStaff = staffData.filter((member) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearchTerm =
      member.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.accType.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.username.toLowerCase().includes(lowerCaseSearchTerm);

    // If the user is admin, show only staff
    if (userType === "admin") {
      return matchesSearchTerm && member.accType.toLowerCase() === "staff";
    }

    // If the user is superadmin, show both staff and admin
    if (userType === "superadmin") {
      return matchesSearchTerm;
    }

    // Default case (for staff or any other case)
    return matchesSearchTerm && member.accType.toLowerCase() === "staff";
  });

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

  // Count the number of admins and staff if the user is a superadmin
  const adminCount = staffData.filter(
    (member) => member.accType.toLowerCase() === "admin"
  ).length;
  const staffCount = staffData.filter(
    (member) => member.accType.toLowerCase() === "staff"
  ).length;

  if (loading) {
    return <Loading />; // Show loading spinner while fetching data
  }

  return (
    <>
      <AnalyticsContainer>
        {/* Show Staff card for both admin and superadmin */}
        {(userType === "admin" || userType === "superadmin") && (
          <Card
            label="Staff"
            value={`${staffCount}`}
            bgColor={colors.primary}
            icon={<FaUsers />}
          />
        )}
        {/* Show Admin card only for superadmin */}
        {userType === "superadmin" && (
          <Card
            label="Admin"
            value={`${adminCount}`}
            bgColor={colors.primary}
            icon={<FaUsers />}
          />
        )}
      </AnalyticsContainer>
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
