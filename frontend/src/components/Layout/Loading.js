import React from 'react';
import styled from 'styled-components';
import catGif from '../../assets/cat.gif'; // Import the GIF from the assets folder

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh; /* Full height of the viewport */
  background-color: rgba(255, 255, 255, 0.8); /* Optional background */
`;

const Loading = () => (
  <LoadingContainer>
    <img src={catGif} alt="Loading..." width="250" height="250" /> {/* Display the cat GIF */}
  </LoadingContainer>
);

export default Loading;
