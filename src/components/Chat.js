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
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const Chat = ({ cvData }) => { // Removed apiKey prop
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'User', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `
You are an AI assistant. You are talking to a recruiter about a candidate.
You can only talk about the candidate or every subjects that can be linked to the candidate such as Programming or Electronics.
Traduct in the correct language everyting. Do not hallucinate or talk about anything else.
if the input is in an other language then english search the corresponding translation in english to search the answer but reply in the language of the input.
${cvData}
`;

      const response = await axios.post('/api/chat', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
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
    setInput('');
  };

  return (
    <Box
      sx={{
        width: '100%',          // Full width
        height: '100vh',        // Full viewport height
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        boxSizing: 'border-box', // Ensure padding doesn't cause overflow
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        ASK THE AI ASSISTANT ANYTHING
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevent overflow in the container
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            padding: 2,
            overflowY: 'auto',    // Enable scrolling within the chat area
            backgroundColor: '#f5f5f5',
          }}
        >
          {messages.map((msg, index) => (
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
                sx={{ bgcolor: msg.sender === 'User' ? 'primary.main' : 'secondary.main' }}
              >
                {msg.sender.charAt(0)}
              </Avatar>
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: msg.sender === 'User' ? 'primary.light' : 'secondary.light',
                  color: 'black',
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
          ))}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <CircularProgress size={20} sx={{ marginRight: 1 }} />
              <Typography variant="body2">AI is typing...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>
        <Box sx={{ display: 'flex', marginTop: 1 }}>
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
            sx={{ flexGrow: 1, marginRight: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
