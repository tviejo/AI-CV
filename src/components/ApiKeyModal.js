// src/components/ApiKeyModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ApiKeyModal = ({ isOpen, onSave }) => {
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_OPENAI_API_KEY || '');

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="API Key"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <h2>Your OpenAI API Key</h2>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        style={{ width: '100%', padding: '8px' }}
      />
      <button onClick={handleSave} style={{ marginTop: '10px' }}>
        Save
      </button>
    </Modal>
  );
};

export default ApiKeyModal;
