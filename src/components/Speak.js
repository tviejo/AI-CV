// src/components/Speak.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { X, Zap } from 'react-feather';
import './Speak.scss'; // Create corresponding SCSS for styling

const Speak = () => {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]); // Chat messages
  const [isLoading, setIsLoading] = useState(false);

  // Refs for recorder, player, and client
  const recorderRef = useRef(null);
  const playerRef = useRef(null);
  const clientRef = useRef(null);

  // Environment variables
  const LOCAL_RELAY_SERVER_URL = process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';
  const apiKey = LOCAL_RELAY_SERVER_URL
    ? '' // API key is not needed if using a relay server
    : process.env.REACT_APP_OPENAI_API_KEY || '';

  // Initialize recorder, player, and client
  useEffect(() => {
    // Initialize WavRecorder and WavStreamPlayer
    recorderRef.current = new WavRecorder({ sampleRate: 24000 });
    playerRef.current = new WavStreamPlayer({ sampleRate: 24000 });

    // Initialize RealtimeClient
    clientRef.current = new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    );

    // Handle real-time responses from the assistant
    clientRef.current.on('conversation.updated', ({ item }) => {
      if (item.formatted.transcript) {
        setMessages((prev) => [...prev, { sender: 'AI', text: item.formatted.transcript }]);
        setIsLoading(false);
      }
    });

    // Handle errors
    clientRef.current.on('error', (error) => {
      console.error('RealtimeClient Error:', error);
      setIsLoading(false);
    });

    // Connect to conversation if not using a relay server
    const connectClient = async () => {
      if (LOCAL_RELAY_SERVER_URL) {
        // If using a relay server, no need to handle audio recording
        try {
          await clientRef.current.connect();
          setIsConnected(true);
          setMessages((prev) => [...prev, { sender: 'AI', text: 'Hello!' }]);
        } catch (error) {
          console.error('Connection error:', error);
        }
      } else {
        try {
          await recorderRef.current.begin();
          await playerRef.current.connect();
          await clientRef.current.connect();
          setIsConnected(true);
          setMessages((prev) => [...prev, { sender: 'AI', text: 'Hello!' }]);

          // Start listening for audio input
          if (clientRef.current.getTurnDetectionType() === 'server_vad') {
            await recorderRef.current.record((data) => clientRef.current.appendInputAudio(data));
          }
        } catch (error) {
          console.error('Connection error:', error);
        }
      }
    };

    connectClient();

    // Cleanup on unmount
    return () => {
      if (recorderRef.current) {
        recorderRef.current.quit().catch(console.error);
      }
      if (playerRef.current) {
        playerRef.current.interrupt().catch(console.error);
      }
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [apiKey, LOCAL_RELAY_SERVER_URL]);

  // Start recording
  const startRecording = async () => {
    setIsRecording(true);
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: 'User', text: '...' }]);

    try {
      await recorderRef.current.record((data) => {
        clientRef.current.appendInputAudio(data);
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsLoading(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    setIsRecording(false);
    try {
      await recorderRef.current.pause();
      clientRef.current.createResponse();
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsLoading(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsConnected(false);
    setMessages([]);
    setIsLoading(false);

    if (recorderRef.current) {
      await recorderRef.current.end();
    }
    if (playerRef.current) {
      await playerRef.current.interrupt();
    }
    if (clientRef.current) {
      await clientRef.current.disconnect();
    }
  };

  return (
    <Box
      className="speak-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        backgroundColor: '#121212',
        color: '#ffffff',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: '#bb86fc' }}>
        AI Voice Chat
      </Typography>

      <Box
        className="chat-box"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          padding: 2,
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            className={`message ${msg.sender === 'User' ? 'user-message' : 'ai-message'}`}
            sx={{
              marginBottom: 2,
              display: 'flex',
              flexDirection: msg.sender === 'User' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box
              className="message-content"
              sx={{
                padding: 1,
                borderRadius: 2,
                maxWidth: '70%',
                backgroundColor: msg.sender === 'User' ? '#6200ea' : '#03dac6',
                color: '#ffffff',
              }}
            >
              {msg.text}
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box className="loading" sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <CircularProgress size={20} sx={{ marginRight: 1, color: '#bb86fc' }} />
            <Typography variant="body2">AI is typing...</Typography>
          </Box>
        )}
      </Box>

      <Box
        className="controls"
        sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {isConnected ? (
          <Button
            variant="contained"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            disabled={isRecording}
            sx={{
              backgroundColor: isRecording ? '#bb86fc' : '#6200ea',
              '&:hover': {
                backgroundColor: isRecording ? '#9a67ea' : '#5a00d2',
              },
            }}
          >
            {isRecording ? 'Release to Send' : 'Push to Talk'}
          </Button>
        ) : (
          <Typography variant="body1" color="error">
            Connecting...
          </Typography>
        )}
        {isConnected && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<X />}
            onClick={handleDisconnect}
            sx={{ marginTop: 1 }}
          >
            Disconnect
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Speak;
