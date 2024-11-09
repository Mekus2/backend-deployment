// SharedProfilePage.js
import React, { useState, useEffect } from "react";
import ChangePassModal from "./ChangePassModal"; // Import the ChangePassModal component
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
  FieldText,
  EditButton,
  SaveChangesButton,
  ChangePasswordText, // Import any necessary styles for the Change Password text
} from "./ProfileStyles"; // Update import path as necessary
import { FaPencilAlt } from "react-icons/fa";
import profilePic from "../../assets/profile.png";

const SharedProfilePage = ({ userRole }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isChangePassModalOpen, setChangePassModalOpen] = useState(false); // State for modal

  const userData = {
    SuperAdmin: {
      firstName: "Maria",
      middleInitial: "S.",
      lastName: "Santos",
      email: "maria.santos@gmail.com",
      contact: "09123456789",
    },
    Admin: {
      firstName: "John",
      middleInitial: "D.",
      lastName: "Doe",
      email: "john.doe@gmail.com",
      contact: "09123456788",
    },
    Staff: {
      firstName: "Jane",
      middleInitial: "A.",
      lastName: "Smith",
      email: "jane.smith@gmail.com",
      contact: "09123456787",
    },
  };

  const [firstName, setFirstName] = useState(userData[userRole].firstName);
  const [middleInitial, setMiddleInitial] = useState(
    userData[userRole].middleInitial
  );
  const [lastName, setLastName] = useState(userData[userRole].lastName);
  const [email, setEmail] = useState(userData[userRole].email);
  const [contact, setContact] = useState(userData[userRole].contact);
  const [profileImage, setProfileImage] = useState(profilePic);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  useEffect(() => {
    if (isEditingName || isEditingEmail || isEditingContact) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [
    isEditingName,
    isEditingEmail,
    isEditingContact,
    firstName,
    middleInitial,
    lastName,
    email,
    contact,
  ]);

  const handleSaveChanges = () => {
    console.log("Changes saved!");
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingContact(false);
    setSaveClicked(true);
    setHasChanges(false);
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
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleProfileImageChange}
          />
        </ProfileImageWrapper>

        <ProfileInfo>
          <AdminText>{userRole}</AdminText>
          <NameText>{`${firstName} ${middleInitial} ${lastName}`}</NameText>
          <EmailText>{email}</EmailText>
        </ProfileInfo>
      </LeftPanel>

      <RightPanel>
        <ProfileField>
          <Label>First Name</Label>
          <FieldContainer>
            {isEditingName ? (
              <InputField
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                showBorder={isEditingName}
              />
            ) : (
              <FieldText>{firstName}</FieldText>
            )}
            <EditButton onClick={() => setIsEditingName(!isEditingName)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

        <ProfileField>
          <Label>Middle Initial</Label>
          <FieldContainer>
            {isEditingName ? (
              <InputField
                type="text"
                value={middleInitial}
                onChange={(e) => setMiddleInitial(e.target.value)}
                showBorder={isEditingName}
              />
            ) : (
              <FieldText>{middleInitial}</FieldText>
            )}
            <EditButton onClick={() => setIsEditingName(!isEditingName)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

        <ProfileField>
          <Label>Last Name</Label>
          <FieldContainer>
            {isEditingName ? (
              <InputField
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                showBorder={isEditingName}
              />
            ) : (
              <FieldText>{lastName}</FieldText>
            )}
            <EditButton onClick={() => setIsEditingName(!isEditingName)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

        <ProfileField>
          <Label>Email</Label>
          <FieldContainer>
            {isEditingEmail ? (
              <InputField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                showBorder={isEditingEmail}
              />
            ) : (
              <FieldText>{email}</FieldText>
            )}
            <EditButton onClick={() => setIsEditingEmail(!isEditingEmail)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

        <ProfileField>
          <Label>Contact</Label>
          <FieldContainer>
            {isEditingContact ? (
              <InputField
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                showBorder={isEditingContact}
              />
            ) : (
              <FieldText>{contact}</FieldText>
            )}
            <EditButton onClick={() => setIsEditingContact(!isEditingContact)}>
              <FaPencilAlt />
            </EditButton>
          </FieldContainer>
        </ProfileField>

        {hasChanges && !saveClicked && (
          <SaveChangesButton onClick={handleSaveChanges}>
            Save Changes
          </SaveChangesButton>
        )}

        {/* Centered Change Password Text */}
        <ChangePasswordText onClick={() => setChangePassModalOpen(true)}>
          Change Password
        </ChangePasswordText>
      </RightPanel>

      {/* Change Password Modal */}
      {isChangePassModalOpen && (
        <ChangePassModal
          onClose={() => setChangePassModalOpen(false)}
          onSave={(newPassword) => {
            console.log("Password changed to:", newPassword);
            setChangePassModalOpen(false);
          }}
        />
      )}
    </ProfileContainer>
  );
};

export default SharedProfilePage;
