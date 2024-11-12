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
import profilePic from "../../assets/profile.png"; // Default image if none exists
import { fetchUserData, updateUserData } from "../../api/ProfileApi";
import axios from "axios";

const SharedProfilePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(profilePic); // Default profile picture
  const [image, setImage] = useState(null); 
  const [hasChanges, setHasChanges] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [isChangePassModalOpen, setChangePassModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        try {
          const userData = await fetchUserData(userId);
          setEmail(userData.email);
          setContact(userData.phonenumber);
          setFirstName(userData.first_name);
          setMiddleInitial(userData.mid_initial);
          setLastName(userData.last_name);

          // Fetch the user profile image
          const imageResponse = await axios.get(`http://127.0.0.1:8000/account/users/${userId}/image/`);
          const imageUrl = imageResponse.data.image_url;
          setProfileImage(imageUrl || profilePic);  
          console.log('image:', imageUrl);
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    };

    fetchData();
  }, []);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setHasChanges(true);

    // Email validation example
    if (e.target.name === "email") {
      const emailValue = e.target.value;
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue)) {
        alert("Invalid email address");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result); // Temporarily display selected image
        setImage(file); // Store file for upload
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      console.error("User ID is missing.");
      return;
    }

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
        console.log("Profile updated successfully");
        console.log("FORM DATA:", userData);
        setSaveClicked(true);
        setHasChanges(false); // Reset changes flag
        setPassword(""); // Clear password field after update
        setImage(null);  // Clear temporary image
        alert("Your profile has been updated successfully.");
      } else {
        console.warn("Unexpected response status:", status);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.detail || "Could not update profile."}`);
      } else {
        alert("An error occurred. Please check your network connection and try again.");
      }
    }
  };
        

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
              onChange={handleImageChange}  // Update flag when image changes
            />
          </ProfileImageWrapper>

          <ProfileInfo>
            <AdminText>{/* Admin Text Placeholder */}</AdminText>
            <NameText>{`${firstName} ${middleInitial} ${lastName}`}</NameText>
            <EmailText>{email}</EmailText>
          </ProfileInfo>
        </LeftPanel>

        <RightPanel>
          {/* User Profile Fields */}
          <ProfileField>
            <Label htmlFor="firstName">First Name</Label>
            <FieldContainer>
              <InputField
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange(setFirstName)}
              />
              <EditButton onClick={() => setHasChanges(true)}>
                <FaPencilAlt />
              </EditButton>
            </FieldContainer>
          </ProfileField>

          <ProfileField>
            <Label htmlFor="middleInitial">Middle Name</Label>
            <FieldContainer>
              <InputField
                type="text"
                id="middleInitial"
                name="middleInitial"
                value={middleInitial}
                onChange={handleChange(setMiddleInitial)}
              />
              <EditButton onClick={() => setHasChanges(true)}>
                <FaPencilAlt />
              </EditButton>
            </FieldContainer>
          </ProfileField>

          <ProfileField>
            <Label htmlFor="lastName">Last Name</Label>
            <FieldContainer>
              <InputField
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange(setLastName)}
              />
              <EditButton onClick={() => setHasChanges(true)}>
                <FaPencilAlt />
              </EditButton>
            </FieldContainer>
          </ProfileField>

          <ProfileField>
          <Label htmlFor="email">Email</Label>
          <FieldContainer>
            <InputField
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange(setEmail)}
              autoComplete="email"
            />
            <EditButton onClick={() => setHasChanges(true)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

          <ProfileField>
            <Label htmlFor="contact">Contact</Label>
            <FieldContainer>
              <InputField
                type="tel"
                id="contact"
                name="contact"
                value={contact}
                onChange={handleChange(setContact)}
                autoComplete="tel"
              />
              <EditButton onClick={() => setHasChanges(true)}>
                <FaPencilAlt />
              </EditButton>
            </FieldContainer>
          </ProfileField>

          {hasChanges && !saveClicked && (
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
