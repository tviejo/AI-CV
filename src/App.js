// src/App.js

import React from 'react';
import Chat from './components/Chat';
import cvData from './data/cvData';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Chat cvData={cvData} />
    </ThemeProvider>
  );
}

export default App;
