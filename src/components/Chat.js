// src/components/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Grid,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const Chat = ({ cvData }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // List of suggestion buttons
  const suggestions = [
    'What is your experience?',
    'What is your contact?',
    'Tell me about your projects.',
    'What are your skills?',
  ];

  // Handle sending messages
  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = { sender: 'User', text: message };
    setConversationHistory((prev) => [...prev, userMessage]);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `
        You are talking to a recruiter about a canditate, Thomas Viejo.
        You can only talk about the candidate or every subject that can be linked to the candidate, such as Programming or Electronics for example.
        If the question is first person, answer in the first person.
        if the question is third person, answer in the third person.
        Speak naturally and provide detailed answers.
        Speak with the language of the recruiter.
        Use the information provided in the CV.
        if the question is about a specific project, provide details about the project.
        If the question is about a specific skill, provide details about the skill.
        If the question is about a specific experience, provide details about the experience.
        If the question is about a specific education, provide details about the education.
        If the question is about a specific certification, provide details about the certification.
        If the question is about a specific contact information, provide details about the contact information.
        if the question is not specific, ask for clarification.
        ${cvData}
        `;

      const response = await axios.post('/api/chat', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      });

      const aiMessage = {
        sender: 'AI',
        text: response.data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        sender: 'AI',
        text: 'Sorry, something went wrong. Please try again later.',
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
    if (sender === 'AI') return 'AI';
    if (sender === 'User') return 'U';
    return sender.charAt(0); // Fallback to first letter
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#121212', // Dark background
        color: '#ffffff', // Light text color
        padding: 2,
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: '#bb86fc' }} // Light purple accent color
      >
        Thomas Viejo AI CV
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#1e1e1e', // Slightly lighter dark background for contrast
          borderRadius: 2,
          padding: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            padding: 2,
            overflowY: 'auto',
            backgroundColor: '#1a1a1a', // Dark chat background
            borderRadius: 2,
          }}
        >
          {messages.length === 0 ? (
            // Initial state with suggestions and send button
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ height: '100%' }}
            >
              <Grid item sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <TextField
                    variant="outlined"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                    fullWidth
                    sx={{
                      backgroundColor: '#333333', // Input field background
                      input: { color: '#ffffff' }, // Input text color
                      fieldset: { borderColor: '#bb86fc' }, // Input border color
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    sx={{
                      marginLeft: 1,
                      backgroundColor: '#bb86fc',
                      '&:hover': {
                        backgroundColor: '#9a67ea',
                      },
                      color: '#ffffff',
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </Grid>
              <Grid item container spacing={2} justifyContent="center">
                {suggestions.map((suggestion, index) => (
                  <Grid item key={index}>
                    <Button
                      variant="contained"
                      onClick={() => handleSuggestion(suggestion)}
                      sx={{
                        backgroundColor: '#bb86fc',
                        '&:hover': {
                          backgroundColor: '#9a67ea',
                        },
                        color: '#ffffff',
                      }}
                    >
                      {suggestion}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ) : (
            // Display chat messages
            messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  marginBottom: 2,
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'User' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.sender === 'User' ? '#6200ea' : '#03dac6', // Purple for User, Teal for AI
                    color: '#ffffff',
                    width: 40,
                    height: 40,
                    fontSize: '1rem',
                  }}
                >
                  {getAvatarContent(msg.sender)}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: msg.sender === 'User' ? '#6200ea' : '#03dac6', // Bubble colors
                    color: '#ffffff',
                    padding: 1,
                    borderRadius: 2,
                    marginX: 1,
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
                </Box>
              </Box>
            ))
          )}

          {isLoading && messages.length !== 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <CircularProgress size={20} sx={{ marginRight: 1, color: '#bb86fc' }} />
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                AI is typing...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>
        {messages.length !== 0 && (
          // Input area for sending messages
          <Box sx={{ display: 'flex', marginTop: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
              fullWidth
              sx={{
                flexGrow: 1,
                marginRight: 1,
                backgroundColor: '#333333', // Input field background
                input: { color: '#ffffff' }, // Input text color
                fieldset: { borderColor: '#bb86fc' }, // Input border color
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              sx={{
                backgroundColor: '#bb86fc',
                '&:hover': {
                  backgroundColor: '#9a67ea',
                },
                color: '#ffffff',
              }}
            >
              Send
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
