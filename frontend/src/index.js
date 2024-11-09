// Import the necessary modules
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css'; // Import your global CSS file

// Import Google Fonts CSS using <link> tags
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap';
document.head.appendChild(link);

// Render the root component
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
