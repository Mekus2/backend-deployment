import React from "react";
import styled from "styled-components";
import sadDog from "../assets/sad.gif";
import { colors } from "../colors";
import Button from "../components/Layout/Button";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go to the previous page
  };

  return (
    <Wrapper>
      <ContentContainer>
        <SadDogContainer>
          <SadDogImage src={sadDog} alt="Sad dog" />
        </SadDogContainer>
        <Content>
          <Title>404</Title>
          <Subtitle>
            Oops! <br /> Page Not Found
          </Subtitle>
          <Description>
            The page you're looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Description>
          <ButtonContainer>
            <Button variant="primary" onClick={handleGoBack}>
              Back
            </Button>
          </ButtonContainer>
        </Content>
      </ContentContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${colors.background};
  position: relative;
`;

const ContentContainer = styled.div`
  position: relative;
`;

const Content = styled.div`
  text-align: center;
  padding: 2rem;
  border: 4px solid black;
  border-radius: 8px;
  background: white;
  position: relative;
  z-index: 1;
  height: 450px;
  max-width: 500px; /* Limit the width */
  width: 100%; /* Make it responsive */
`;

const Title = styled.h1`
  font-size: 6rem;
  color: ${colors.red};
  margin: 0;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  color: ${colors.orange};
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${colors.text};
  margin: 1rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const SadDogContainer = styled.div`
  position: absolute;
  top: -130px;
  left: 50%;
  transform: translateX(-50%);
  width: 230px;
  height: 128px;
  z-index: 2;
`;

const SadDogImage = styled.img`
  width: 300px;
  height: auto;
  opacity: 1;
`;

export default NotFoundPage;
