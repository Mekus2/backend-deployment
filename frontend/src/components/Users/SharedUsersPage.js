import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import AddUserModal from "../../components/Users/AddUserModal";
import UserDetailsModal from "../../components/Users/UserDetailsModal";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalStaffs from "../../components/CardsData/CardTotalStaffs";
import Button from "../../components/Layout/Button";
import { FaPlus } from "react-icons/fa";
import { fetchTotalStaff, fetchStaff } from "../../api/StaffApi"; // Import API functions
import axios from "axios"; // Import axios for HTTP requests
import profilePic from "../../assets/profile.png"; // Import the default image

const SharedUsersPage = () => {
  const [userType, setUserType] = useState(null);
  const [staffData, setStaffData] = useState([]); // State to store fetched staff data
  const [totalStaff, setTotalStaff] = useState(0); // State for total staff count
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [imageUrls, setImageUrls] = useState({}); // State to store image URLs for staff

  useEffect(() => {
    // Fetch user type from local storage
    const storedUserType = localStorage.getItem("user_type");
    setUserType(storedUserType);

    // Fetch total staff count
    fetchTotalStaff()
      .then((data) => setTotalStaff(data.total))
      .catch((error) => console.error(error));

    // Fetch all staff data
    fetchStaff()
      .then((data) => {
        setStaffData(data);

        // Fetch images for each user
        const fetchImages = async () => {
          const newImageUrls = {};
          for (const member of data) {
            try {
              // Fetch the image for each user by user ID
              const imageResponse = await axios.get(`http://127.0.0.1:8000/account/users/${member.id}/image/`);
              const imageUrl = imageResponse.data.image_url;
              // Use profilePic as fallback if imageUrl is null
              newImageUrls[member.id] = imageUrl || profilePic; 
            } catch (error) {
              console.error("Failed to fetch image for user:", member.id);
              newImageUrls[member.id] = profilePic; // Fallback to profilePic on error
            }
          }
          setImageUrls(newImageUrls); // Store image URLs in state
        };

        fetchImages(); // Call the function to fetch images
      })
      .catch((error) => console.error(error));
  }, []);

  // Filter staff data based on search term
  const filteredStaff = staffData.filter((member) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.accType.toLowerCase().includes(lowerCaseSearchTerm) ||
      member.username.toLowerCase().includes(lowerCaseSearchTerm)
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

  // Fetch user details by ID and open details modal
  const openDetailsModal = async (user) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/account/users/${user.id}/`);
      console.log('API Response:', response.data); // Log the response to check if the data is correct
      setSelectedUser(response.data); // Set the fetched data into state
      setIsDetailsModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const headers = ["Image", "Name", "Role",  "Actions"];

  const rows = filteredStaff.map((member) => [
    <ImageContainer key={member.id}>
      {/* Fetch and display the image from the imageUrls state */}
      <img
        src={imageUrls[member.id]} // Use the fetched image URL or profilePic as fallback
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
          placeholder={`Search / Filter ${userType === "admin" ? "staff..." : "users..."}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <StyledButton
          backgroundColor={colors.primary}
          hoverColor={colors.primaryHover}
          onClick={() => setIsAddModalOpen(true)}
        >
          <FaPlus className="icon" /> User
        </StyledButton>
      </Controls>
      <AnalyticsContainer>
        {(userType === "admin" || userType === "superadmin") && (
          <CardTotalStaffs total={totalStaff} /> // Display total staff count for admin and superadmin
        )}
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
      {isAddModalOpen && (
        <AddUserModal onClose={() => setIsAddModalOpen(false)} onSave={handleAddUser} />
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
