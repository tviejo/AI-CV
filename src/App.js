// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Speak from './components/Speak';
import HomePage from './components/HomePage';

function App() {
  // Fetch cvData from your source or pass it down as needed
  const cvData = 'Your CV data here';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<Chat cvData={cvData} />} />
        <Route path="/speak" element={<Speak cvData={cvData} />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
