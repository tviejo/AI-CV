// src/components/HomePage.js
import React from 'react';
import Chat from './Chat';

const HomePage = ({ apiKey, cvData }) => {
  return (
    <div>
      <Chat apiKey={apiKey} cvData={cvData} />
    </div>
  );
};

export default HomePage;
