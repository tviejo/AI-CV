// src/App.js
import React from 'react';
import HomePage from './components/HomePage';
import cvData from './data/cvData';

function App() {
  return (
    <div className="App">
      <HomePage cvData={cvData} />
    </div>
  );
}

export default App;
