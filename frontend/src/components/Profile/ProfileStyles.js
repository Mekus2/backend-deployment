// ProfileStyles.js
import styled from "styled-components";
import { colors } from "../../colors";

// Styled components
export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const RightPanel = styled.div`
  flex: 2;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

export const ProfileImageWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
`;

export const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

export const EditProfilePicButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
`;

export const ProfileInfo = styled.div`
  text-align: center;
`;

export const AdminText = styled.p`
  font-size: 14px;
  font-weight: bold;
  margin: 5px 0;
`;

export const NameText = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
`;

export const EmailText = styled.p`
  font-size: 14px;
  color: gray;
  margin: 5px 0;
`;

export const ProfileField = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

export const Label = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
  color: #555;
`;

export const FieldText = styled.p`
  font-size: 18px;
  margin-right: 10px;
  flex: 1;
  display: flex;
  align-items: center;
`;

export const InputField = styled.input`
  padding: 8px;
  font-size: 18px;
  margin-right: 10px;
  border: ${({ showBorder }) => (showBorder ? "1px solid #ccc" : "none")};
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
`;

export const EditButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  margin-left: 10px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 16px;
    width: 16px;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FieldContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
`;

export const EyeIcon = styled.div`
  position: absolute;
  font-size: 1.2rem;
  right: 20px;
  cursor: pointer;
  color: #666;
`;

export const SaveChangesButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;
export const ChangePasswordText = styled.p`
  text-align: center;
  cursor: pointer;
  color: ${colors.primary};
  font-weight: bold;
  margin-top: 20px;

  &:hover {
    color: ${colors.primaryHover};
  }
`;
