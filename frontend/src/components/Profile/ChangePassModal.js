// ChangePassModal.js
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import Button from "../Layout/Button";

const ChangePassModal = ({ onClose, onSave }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  const validate = () => {
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "Current password is required.";
    if (!newPassword) newErrors.newPassword = "New password is required.";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(newPassword);
    onClose();
  };

  return (
    <Backdrop onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer ref={modalRef}>
        <Header>
          <Title>Change Password</Title>
          <CloseButton onClick={onClose}>
            <IoCloseCircle color="#ff5757" size={24} />
          </CloseButton>
        </Header>

        <Content>
          <Field>
            <Label>Current Password</Label>
            <InputContainer>
              <InputField
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Input Current Password"
              />
              <EyeIcon onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </EyeIcon>
            </InputContainer>
            {errors.currentPassword && <ErrorText>{errors.currentPassword}</ErrorText>}
          </Field>
          <Field>
            <Label>New Password</Label>
            <InputContainer>
              <InputField
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Input New Password"
              />
              <EyeIcon onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </EyeIcon>
            </InputContainer>
            {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
          </Field>
          <Field>
            <Label>Confirm Password</Label>
            <InputContainer>
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
              />
              <EyeIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </EyeIcon>
            </InputContainer>
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </Field>
        </Content>

        <Footer>
          <Button variant="red" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Footer>
      </ModalContainer>
    </Backdrop>
  );
};

// Styled Components
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: ${(props) => (props.fixedWidth ? props.fixedWidth : "80%")};
  max-width: 1000px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h2`
  font-weight: bold;
  margin: 0;
  font-size: 25px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const Content = styled.div`
  margin-top: 10px;
`;

const Field = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const EyeIcon = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  background: none;
  border: none;
  cursor: pointer;
`;

const ErrorText = styled.span`
  color: red;
  font-size: 0.75rem;
  margin-top: 3px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export default ChangePassModal;
