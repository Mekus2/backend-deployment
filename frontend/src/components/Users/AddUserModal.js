import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../Layout/Button";
//import { createLog } from "../../api/LogsApi";

const AddUserModal = ({ onClose, onSave }) => {
  const [firstname, setFirstname] = useState("");
  const [midinitial, setMidinitial] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("staff_");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [acctype, setAcctype] = useState("Staff");
  // [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    if (firstname && lastname && acctype) {
      setUsername(`${acctype.toLowerCase()}_${firstname.toLowerCase()}${lastname.toLowerCase()}`.replace(/\s/g, ""));
    } else {
      setUsername(`${acctype.toLowerCase()}_`); 
    }
  }, [firstname, lastname, acctype]);

  const validateFields = () => {
    const newErrors = {};
    if (!firstname) newErrors.firstname = "First name is required.";
    if (!lastname) newErrors.lastname = "Last name is required.";
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) newErrors.password = "Password is required.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^0\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must start with '0' and be 11 digits long.";
    }
    if (!address) newErrors.address = "Address is required.";
    //if (!image) newErrors.image = "Image is required.";
    return newErrors;
  };

  const handleSave = async () => {
    // Validate fields
    const validationErrors = validateFields();
    setErrors(validationErrors);
  
    // If there are validation errors, don't proceed
    if (Object.keys(validationErrors).length > 0) return;
  
    // Confirm before submitting the data
    if (window.confirm("Are you sure you want to add this user?")) {
      const formData = new FormData();
      formData.append("username", username);  // No "user_" prefix
      formData.append("first_name", firstname);  // No "user_" prefix
      formData.append("mid_initial", midinitial);  // No "user_" prefix
      formData.append("last_name", lastname);  // No "user_" prefix
      formData.append("email", email);  // No "user_" prefix
      formData.append("password", password);  // No "user_" prefix
      formData.append("phonenumber", phoneNumber);  // No "user_" prefix
      formData.append("address", address);  // No "user_" prefix
      formData.append("accType", acctype);  // No "user_" prefix
     // if (image) formData.append("image", image);  // No "user_" prefix
  
      // Debugging: Log FormData to check the fields
      console.log("FormData:", Object.fromEntries(formData.entries()));
  
      try {
        // Make the API request to create the user
        const response = await fetch("http://127.0.0.1:8000/account/register/", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        
        console.log("Backend response:", result);  // Log the response for debugging
  
        if (response.ok) {
          // On successful response
          onSave(result);
          onClose();
          logUserCreation(result);
        } else {
          // Handle validation errors for each field
          if (result.username) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              username: result.username[0], // Display error for username
            }));
            alert(`Error: Username "${username}" is already taken.`);
          }
  
          if (result.email) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              email: result.email[0], // Display error for email
            }));
            alert(`Error: Email "${email}" is already taken.`);
          }
  
          // Generic error handling if no specific username/email error exists
          if (!result.username && !result.email && result.detail) {
            alert(`Error: ${result.detail || "An error occurred"}`);
          } else if (!result.username && !result.email) {
            alert("An unknown error occurred. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const logUserCreation = async (user) => {
    // Fetch the user_id from localStorage
    const userId = localStorage.getItem("user_id"); // Make sure "user_id" is the correct key

    // Get first_name and last_name from the user object
    const { first_name, last_name } = user;

    // Prepare the log payload with the user's first name and last name
    const logPayload = {
        LLOG_TYPE: "User logs",
        LOG_DESCRIPTION: `Added new user: ${first_name} ${last_name}`,
        USER_ID: userId, // Use the user_id from localStorage
    };

    try {
        // Send the log data to the backend
        const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
            method: "POST",
            body: JSON.stringify(logPayload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            console.log("Log successfully created:", logPayload);
        } else {
            const errorData = await response.json();
            console.error("Failed to create log:", errorData);
        }
    } catch (error) {
        console.error("Error logging user creation:", error);
    }
};


  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.type.split('/')[0] === 'image') {
  //       const reader = new FileReader();
  //       reader.onloadend = () => setImage(reader.result);
  //       reader.readAsDataURL(file);
  //     } else {
  //       setErrors((prev) => ({ ...prev, image: "Please upload a valid image file." }));
  //     }
  //   }
  // };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const isSuperadminPage = window.location.pathname.includes("/superadmin/users");
  const isAdminPage = window.location.pathname.includes("/admin/users");

  return (
    <ModalOverlay>
      <ModalContent ref={modalRef}>
        <ModalHeader>
          <h2>Add User</h2>
          <CloseButton onClick={onClose}><IoCloseCircle /></CloseButton>
        </ModalHeader>
        <ModalBody>
          <Field><Label>First Name</Label><Input value={firstname} onChange={(e) => setFirstname(e.target.value)} />{errors.firstname && <ErrorMessage>{errors.firstname}</ErrorMessage>}</Field>
          <Field><Label>Middle Name</Label><Input value={midinitial} onChange={(e) => setMidinitial(e.target.value)} /></Field>
          <Field><Label>Last Name</Label><Input value={lastname} onChange={(e) => setLastname(e.target.value)} />{errors.lastname && <ErrorMessage>{errors.lastname}</ErrorMessage>}</Field>
          <Field><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} />{errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}</Field>
          <Field>
            <Label>Phone Number</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={11}
            />
            {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber}</ErrorMessage>}
          </Field>
          <Field><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />{errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}</Field>
          <Field><Label>Username</Label><Input value={username} readOnly /></Field>
          <Field>
            <Label>Password</Label>
            <PasswordWrapper>
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <TogglePasswordButton onClick={togglePasswordVisibility}>{showPassword ? <FaEye /> : <FaEyeSlash />}</TogglePasswordButton>
            </PasswordWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </Field>
          {password && (
            <Field>
              <Label>Confirm Password</Label>
              <PasswordWrapper>
                <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <TogglePasswordButton onClick={toggleConfirmPasswordVisibility}>{showConfirmPassword ? <FaEye /> : <FaEyeSlash />}</TogglePasswordButton>
              </PasswordWrapper>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </Field>
          )}
          {isSuperadminPage && <Field><Label>Account Type</Label><Select value={acctype} onChange={(e) => setAcctype(e.target.value)}><option value="staff">Staff</option><option value="admin">Admin</option></Select></Field>}
          {isAdminPage && <Field><Label>Account Type</Label><Select value={acctype} onChange={(e) => setAcctype(e.target.value)}><option value="staff">Staff</option></Select></Field>}
        </ModalBody>
        <ModalFooter>
          <Button variant="red" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Add User</Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.red};
`;

const ModalBody = styled.div``;

const Field = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const PasswordWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TogglePasswordButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

// const ImageContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px;

//   img {
//     width: 100px;
//     height: 100px;
//     object-fit: cover;
//     border-radius: 50%;
//   }
// `;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  button:first-of-type {
    margin-right: 10px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
`;

export default AddUserModal;
