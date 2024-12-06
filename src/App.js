// src/App.js

import React from 'react';
import Chat from './components/Chat';
import cvData from './data/cvData';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <ThemeProvider>
      <Chat cvData={cvData} />
    </ThemeProvider>
  );
}

export default App;
