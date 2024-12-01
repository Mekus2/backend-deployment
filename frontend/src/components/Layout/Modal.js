import React from "react";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5";

const Modal = ({
  title,
  status,
  completedDate,
  children,
  onClose,
  fixedWidth,
}) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <ModalContainer fixedWidth={fixedWidth}>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>
            <IoCloseCircle color="#ff5757" size={24} />
          </CloseButton>
        </Header>

        {status && (
          <StatusContainer status={status}>
            {status}
            {status === "Completed" && (
              <CompletedDate>{completedDate || ""}</CompletedDate>
            )}
          </StatusContainer>
        )}

        <Content>{children}</Content>
      </ModalContainer>
    </Backdrop>
  );
};

// Styled components
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
  box-sizing: border-box; /* Ensures padding is included in width calculation */
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

const StatusContainer = styled.span`
  background-color: ${(props) =>
    props.status === "Completed" ||
    props.status === "In stock" ||
    props.status === "Received" ||
    props.status === "Paid" ||
    props.status === "Accepted" ||
    props.status === "Delivered"
      ? "#1DBA0B"
      : props.status === "Shipped" ||
        props.status === "Low stock" ||
        props.status === "In Progress" ||
        props.status === "Dispatched" ||
        props.status === "Dispatched"
      ? "#f08400"
      : props.status === "Cancelled" ||
        props.status === "Out of stock" ||
        props.status === "Awaiting" ||
        props.status === "Pending"
      ? "#ff5757"
      : props.status === "Processing" || props.status === "Approved"
      ? "#00C4FF"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin-top: 10px;
  align-self: flex-end;
`;

const CompletedDate = styled.div`
  font-size: 11px;
  opacity: 0.7;
`;

const Content = styled.div`
  margin-top: 10px;
  overflow-x: auto; /* Allow horizontal scroll if content overflows */
`;

export default Modal;
