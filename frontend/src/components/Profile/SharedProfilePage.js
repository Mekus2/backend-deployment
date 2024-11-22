import React, { useState, useEffect } from "react";
import ChangePassModal from "./ChangePassModal";
import {
  ProfileContainer,
  LeftPanel,
  RightPanel,
  ProfileImageWrapper,
  ProfileImage,
  EditProfilePicButton,
  ProfileInfo,
  AdminText,
  NameText,
  EmailText,
  ProfileField,
  Label,
  FieldContainer,
  InputField,
  EditButton,
  SaveChangesButton,
  ChangePasswordText,
} from "./ProfileStyles";
import { FaPencilAlt } from "react-icons/fa";
import profilePic from "../../assets/profile.png"; // Default image
import { fetchUserData, updateUserData } from "../../api/ProfileApi";
import axios from "axios";
import { notify } from "../Layout/CustomToast"; // Toast integration
import Loading from "../Layout/Loading"; // Spinner component

const SharedProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(profilePic);
  const [image, setImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePassModalOpen, setChangePassModalOpen] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0); // Track the last toast time

  // Edit mode tracking
  const [editMode, setEditMode] = useState({
    firstName: false,
    middleInitial: false,
    lastName: false,
    email: false,
    contact: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem("user_id");
      if (userId) {
        try {
          const userData = await fetchUserData(userId);
          setEmail(userData.email);
          setContact(userData.phonenumber);
          setFirstName(userData.first_name);
          setMiddleInitial(userData.mid_initial);
          setLastName(userData.last_name);
          setUsername(userData.username);
          const imageResponse = await axios.get(
            `http://127.0.0.1:8000/account/users/${userId}/image/`
          );
          setProfileImage(imageResponse.data.image_url || profilePic);
        } catch (error) {
          console.error("Failed to load user data:", error);
          notify.error("Failed to load user data.");
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (field, e) => {
    const value = e.target.value;

    if (field === "contact" && !/^\d{0,11}$/.test(value)) return;

    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "middleInitial":
        setMiddleInitial(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "contact":
        setContact(value);
        break;
      default:
        break;
    }

    if (
      value !==
      (field === "firstName"
        ? firstName
        : field === "middleInitial"
        ? middleInitial
        : field === "lastName"
        ? lastName
        : field === "email"
        ? email
        : contact)
    ) {
      setHasChanges(true);
      const currentTime = Date.now();
      
      // Show toast only if 5 seconds have passed since the last toast
      if (currentTime - lastToastTime >= 5000) {
        notify.info("Make sure to save changes!");  // Display toast when changes are made
        setLastToastTime(currentTime);  // Update the last toast time
      }
    }
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBlur = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
  };

  const validateContactNumber = (contactNumber) => {
    const regex = /^0\d{10}$/;
    return regex.test(contactNumber);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
        setImage(file);
        setHasChanges(true);
        
        const currentTime = Date.now();
        
        // Show toast only if 5 seconds have passed since the last toast
        if (currentTime - lastToastTime >= 5000) {
          notify.info("Make sure to save changes!");  // Display toast when image changes
          setLastToastTime(currentTime);  // Update the last toast time
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      notify.error("User ID is missing.");
      return;
    }

    if (contact && !validateContactNumber(contact)) {
      notify.error(
        "Please enter a valid contact number (11 digits, starting with 0)."
      );
      return;
    }

    setIsLoading(true);
    try {
      const userData = new FormData();
      if (email) userData.append("email", email);
      if (contact) userData.append("phonenumber", contact);
      if (firstName) userData.append("first_name", firstName);
      if (middleInitial) userData.append("mid_initial", middleInitial);
      if (lastName) userData.append("last_name", lastName);
      if (password) userData.append("password", password);
      if (image) userData.append("image", image);

      const { status } = await updateUserData(userData);

      if (status === 200) {
        notify.success("Profile updated successfully.");
        setHasChanges(false);
        setPassword("");
        setImage(null);
      } else {
        notify.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      notify.error("Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <ProfileContainer>
      <LeftPanel>
        <ProfileImageWrapper>
          <ProfileImage src={profileImage} alt="Profile" />
          <EditProfilePicButton htmlFor="upload-photo">
            <FaPencilAlt />
          </EditProfilePicButton>

          <input
            type="file"
            id="upload-photo"
            name="profileImage"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
        </ProfileImageWrapper>

        <ProfileInfo>
          <AdminText>{/* Admin Text Placeholder */}</AdminText>
          <NameText>{`${firstName} ${middleInitial} ${lastName}`}</NameText>
          <EmailText>{username}</EmailText>
        </ProfileInfo>
      </LeftPanel>

      <RightPanel>
        {["firstName", "middleInitial", "lastName", "email", "contact"].map(
          (field) => (
            <ProfileField key={field}>
              <Label htmlFor={field}>
                {field
                  .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Add space before capital letters
                  .replace(/^./, (str) => str.toUpperCase())} {/* Capitalize the first letter */}
              </Label>
              <FieldContainer>
                <InputField
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  name={field}
                  value={field === "firstName" ? firstName : field === "middleInitial" ? middleInitial : field === "lastName" ? lastName : field === "email" ? email : contact}
                  onChange={(e) => handleChange(field, e)}
                  onBlur={() => handleBlur(field)}
                  disabled={!editMode[field]} // Use disabled when not in edit mode
                  className={editMode[field] ? "highlight" : ""}
                  style={{
                    border: editMode[field]
                      ? "2px solid #ccc"
                      : "1px solid #fff",
                  }}
                />

                <EditButton onClick={() => toggleEditMode(field)}>
                  <FaPencilAlt />
                </EditButton>
              </FieldContainer>
            </ProfileField>
          )
        )}
        {hasChanges && (
          <SaveChangesButton onClick={handleSaveChanges}>
            Save Changes
          </SaveChangesButton>
        )}
        <ChangePasswordText onClick={() => setChangePassModalOpen(true)}>
          Change Password
        </ChangePasswordText>
      </RightPanel>

      {isChangePassModalOpen && (
        <ChangePassModal
          onClose={() => setChangePassModalOpen(false)}
          onSave={(newPassword) => {
            setPassword(newPassword);
            setChangePassModalOpen(false);
          }}
        />
      )}
    </ProfileContainer>
  );
};

export default SharedProfilePage;
