// src/components/Chat.js

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon, FaPaperPlane } from 'react-icons/fa';

const Chat = ({ cvData }) => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage if available
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Save messages to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // List of suggestion buttons
  const suggestions = [
    'What is your experience?',
    'What is your contact?',
    'Tell me about your projects.',
    'What are your skills?',
  ];

  // Function to build the message history for the API
  const buildMessageHistory = (userMessage) => {
    const currentDate = dayjs().format('MMMM D, YYYY'); // e.g., December 6, 2024
    const systemPrompt = `
      Today's date is ${currentDate}.
      You are talking to a recruiter about a candidate, Thomas Viejo.
      You can only talk about the candidate or related subjects (e.g., Programming, Electronics).
      If the question is first person, answer in first person.
      If the question is third person, answer in third person.
      Speak naturally and provide detailed answers.
      Speak with the language of the recruiter.
      Use the information provided in the CV.
      If the question is about a specific project, skill, experience, education, or certification, provide details.
      If the question is about specific contact information, provide it.
      If the question is not specific, ask for clarification.

      ${cvData}
    `;

    // Convert existing messages into a role-based format
    const history = messages.map((msg) => ({
      role: msg.sender === 'User' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add the new user message at the end
    const completeMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    return completeMessages;
  };

  // Handle sending messages
  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    const timestamp = dayjs().format('HH:mm');
    const userMessage = { sender: 'User', text: message, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const completeMessages = buildMessageHistory(message);

      const response = await axios.post('/api/chat', {
        messages: completeMessages,
      });

      const aiResponse = response.data.choices[0].message.content.trim();
      const aiMessage = {
        sender: 'AI',
        text: aiResponse,
        timestamp: dayjs().format('HH:mm'),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        sender: 'AI',
        text: 'Sorry, something went wrong. Please try again later.',
        timestamp: dayjs().format('HH:mm'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setInput(''); // Clear input after sending
  };

  // Handle suggestion button clicks
  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  // Function to get Avatar content based on sender
  const getAvatarContent = (sender) => {
    if (sender === 'AI') return '🤖';
    if (sender === 'User') return '👤';
    return sender.charAt(0);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: mode === 'dark' ? 'linear-gradient(135deg, #1f1c2c, #928dab)' : 'linear-gradient(135deg, #ece9e6, #ffffff)',
        color: mode === 'dark' ? '#ffffff' : '#000000',
        padding: 3,
        boxSizing: 'border-box',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          Thomas Viejo AI CV
        </Typography>
        {/* Theme Toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <FaSun /> : <FaMoon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Chat Container */}
      <Paper
        elevation={6}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? '#2c2c2c' : '#f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Message Area */}
        <Box
          sx={{
            flexGrow: 1,
            padding: 2,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {messages.length === 0 && !isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: mode === 'dark' ? '#cccccc' : '#666666',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Welcome to Thomas Viejo's AI CV Chat
              </Typography>
              <Typography variant="body1" gutterBottom>
                Start by asking a question or use one of the suggestions below.
              </Typography>
              <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
                {suggestions.map((suggestion, index) => (
                  <Grid item key={index}>
                    <Button
                      variant="contained"
                      onClick={() => handleSuggestion(suggestion)}
                      sx={{
                        backgroundColor: mode === 'dark' ? '#6200ea' : '#03dac6',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? '#3700b3' : '#018786',
                        },
                        color: '#ffffff',
                        borderRadius: '20px',
                        textTransform: 'none',
                        paddingX: 3,
                      }}
                    >
                      {suggestion}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Display Messages */}
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                  flexDirection: msg.sender === 'User' ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: msg.sender === 'User' ? '#6200ea' : '#03dac6',
                    width: 40,
                    height: 40,
                    marginX: 1,
                  }}
                >
                  {getAvatarContent(msg.sender)}
                </Avatar>

                {/* Message Bubble */}
                <Box
                  sx={{
                    maxWidth: '70%',
                    backgroundColor: msg.sender === 'User' ? '#6200ea' : '#03dac6',
                    color: msg.sender === 'User' ? '#ffffff' : '#000000',
                    padding: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    position: 'relative',
                  }}
                >
                  {msg.sender === 'AI' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <Typography variant="body1">{msg.text}</Typography>
                  )}
                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: -16,
                      right: 8,
                      color: mode === 'dark' ? '#aaaaaa' : '#555555',
                    }}
                  >
                    {msg.timestamp}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 2,
                flexDirection: 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#03dac6',
                  width: 40,
                  height: 40,
                  marginX: 1,
                }}
              >
                🤖
              </Avatar>
              <Box
                sx={{
                  backgroundColor: '#03dac6',
                  color: '#000000',
                  padding: 1.5,
                  borderRadius: 2,
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  position: 'relative',
                }}
              >
                <Typography variant="body1">AI is typing...</Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            padding: 2,
            borderTop: mode === 'dark' ? '1px solid #444444' : '1px solid #dddddd',
            backgroundColor: mode === 'dark' ? '#2c2c2c' : '#ffffff',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
              fullWidth
              sx={{
                backgroundColor: mode === 'dark' ? '#3a3a3a' : '#f9f9f9',
                borderRadius: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#6200ea',
                  },
                  '&:hover fieldset': {
                    borderColor: '#03dac6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#03dac6',
                  },
                },
                '& .MuiInputBase-input': {
                  color: mode === 'dark' ? '#ffffff' : '#000000',
                },
                marginRight: 2,
              }}
            />
            <Tooltip title="Send">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  sx={{
                    backgroundColor: '#6200ea',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#3700b3',
                    },
                  }}
                >
                  <FaPaperPlane />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
