import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';


const Speak = ({ cvData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  // Check for browser support
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const synth = window.speechSynthesis;

  const handleListen = () => {
    if (!recognition) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      handleSend(speechToText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const handleSend = async (message) => {
    if (!message.trim()) return;

    const userMessage = { sender: 'User', text: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `
You are an AI assistant. You are talking to a recruiter about a candidate.
You can only talk about the candidate or every subject that can be linked to the candidate, such as Programming or Electronics.
Translate in the correct language everything. Do not hallucinate or talk about anything else.
If the input is in another language, translate it into English to find the answer but reply in the language of the input.
${cvData}
      `;

      const response = await axios.post('/api/stream', {
        prompt: systemPrompt + `\nUser: ${message}\nAI:`,
        stream: true,
      });

      const aiMessage = { sender: 'AI', text: '' };
      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      let chunk;
      while (!(chunk = await reader.read()).done) {
        const text = decoder.decode(chunk.value, { stream: true });
        aiMessage.text += text;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = aiMessage;
          return updatedMessages;
        });
      }

      handleSpeak(aiMessage.text);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        sender: 'AI',
        text: 'Sorry, something went wrong. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      handleSpeak(errorMessage.text);
    }

    setIsLoading(false);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    } else {
      alert('Speech Synthesis API is not supported in this browser.');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
        padding: 2,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#bb86fc' }}
      >
        Speak with the AI Assistant
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          padding: 2,
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'User' ? 'flex-end' : 'flex-start',
              marginBottom: 2,
            }}
          >
              <Typography
                variant="body1"
                sx={{
                  maxWidth: '70%',
                  backgroundColor: msg.sender === 'User' ? '#6200ea' : '#03dac6',
                  color: '#ffffff',
                  padding: 1,
                  borderRadius: 2,
                }}
              >
                {msg.text}
              </Typography>
          </Box>
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <CircularProgress size={20} sx={{ marginRight: 1, color: '#bb86fc' }} />
            <Typography variant="body2" sx={{ color: '#ffffff' }}>
              AI is processing...
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <IconButton
          onClick={handleListen}
          sx={{
            backgroundColor: isRecording ? '#9a67ea' : '#bb86fc',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isRecording ? '#7e57c2' : '#9a67ea',
            },
          }}
        >
          {isRecording ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Speak;
