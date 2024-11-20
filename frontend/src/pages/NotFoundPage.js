import React from "react";
import styled from "styled-components";
import sadDog from "../assets/sad.gif";
import { colors } from "../colors";
import Button from "../components/Layout/Button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
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
          <Description></Description>
          <HomeLink to="/staff/dashboard">
            <Button variant="primary">Go to Home</Button>
          </HomeLink>
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

const HomeLink = styled(Link)`
  text-decoration: none;
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
