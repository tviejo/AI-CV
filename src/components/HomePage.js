// src/components/HomePage.js
import React from 'react';
import Chat from './Chat';

const HomePage = ({ cvData }) => {
  return (
    <div>
      <Chat cvData={cvData} />
    </div>
  );
};

export default HomePage;