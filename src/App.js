// src/App.js
import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import cvData from './data/cvData';

function App() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    } else {
      console.warn('OpenAI API key is not set in the environment variables.');
      // Optionally, handle the absence of the API key
    }
  }, []);

  return (
    <div className="App">
      {apiKey ? (
        <HomePage apiKey={apiKey} cvData={cvData} />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>API Key Missing</h2>
          <p>Please set your OpenAI API key in the .env file.</p>
        </div>
      )}
    </div>
  );
}

export default App;
