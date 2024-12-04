// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Speak from './components/Speak';
import HomePage from './components/HomePage';
import cvData from './data/cvData';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<Chat cvData={cvData} />} />
        <Route path="/speak" element={<Speak cvData={cvData} />} />
      </Routes>
    </Router>
  );
}

export default App;
