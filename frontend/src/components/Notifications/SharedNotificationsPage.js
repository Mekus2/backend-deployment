import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import CardTotalNotification from "../../components/CardsData/CardTotalNotification";
import { NOTIFICATION as initialNotificationData } from "../../data/NotificationData";
import { useNotification } from "../../context/NotificationContext";

// Helper function to parse the timestamp into a comparable date object
const parseTimestamp = (timestamp) => {
  const [datePart, timePart] = timestamp.split(" - ");
  const [month, day, year] = datePart.split(" ");
  const [hour, minute, second] = timePart.split(":");
  const period = timePart.split(" ")[1];

  const monthMap = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };

  let adjustedHour = parseInt(hour);
  if (period === "PM" && adjustedHour !== 12) adjustedHour += 12;
  if (period === "AM" && adjustedHour === 12) adjustedHour = 0;

  return new Date(year, monthMap[month], parseInt(day), adjustedHour, parseInt(minute), parseInt(second));
};

const SharedNotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotificationData);
  const [searchTerm, setSearchTerm] = useState("");
  const { setUnreadCount } = useNotification();

  // Update unread count when notifications change
  useEffect(() => {
    const countUnread = notifications.filter((notif) => !notif.read).length;
    setUnreadCount(countUnread);
  }, [notifications, setUnreadCount]);

  // Toggle read/unread status for the clicked notification
  const toggleReadStatus = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.NOTIF_ID === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  // Filter notifications based on search term
  const filteredNotifications = notifications
    .filter(({ NOTIF_TITLE, NOTIF_MESSAGE, NOTIF_TIMESTAMP }) =>
      [NOTIF_TITLE, NOTIF_MESSAGE, NOTIF_TIMESTAMP].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => parseTimestamp(b.NOTIF_TIMESTAMP) - parseTimestamp(a.NOTIF_TIMESTAMP));

  return (
    <PageContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <SummarySection>
        <CardTotalNotification />
      </SummarySection>
      <NotificationsList>
        {filteredNotifications.map((notification) => (
          <NotificationCard
            key={notification.NOTIF_ID}
            onClick={() => toggleReadStatus(notification.NOTIF_ID)} // Toggle read status when clicked
            read={notification.read} // Apply style based on read/unread state
          >
            <Title read={notification.read}>{notification.NOTIF_TITLE}</Title>
            <Message>{notification.NOTIF_MESSAGE}</Message>
            <Details>
              <Timestamp>{notification.NOTIF_TIMESTAMP}</Timestamp>
            </Details>
            {notification.read && (
              <MarkUnreadButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card's onClick event
                  toggleReadStatus(notification.NOTIF_ID); // Mark as unread
                }}
              >
                Mark as unread
              </MarkUnreadButton>
            )}
          </NotificationCard>
        ))}
      </NotificationsList>
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const NotificationCard = styled.div`
  background-color: ${(props) => (props.read ? "#f0f0f0" : "#e0f7fa")};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: ${(props) => (props.read ? "#d9d9d9" : "#b2ebf2")};
  }
`;

const Title = styled.h3`
  font-size: 18px;
  margin: 0;
  font-weight: ${(props) => (props.read ? "normal" : "bold")}; // Bold if unread
`;

const Message = styled.p`
  font-size: 16px;
  margin: 0;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #777;
`;

const Timestamp = styled.span``;

const MarkUnreadButton = styled.button`
  align-self: flex-end;
  background-color: transparent;
  border: none;
  color: black;
  cursor: pointer;

  &:hover {
    color: darkgray;
    text-decoration: none;
  }
`;

export default SharedNotificationsPage;
