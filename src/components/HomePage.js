// src/components/HomePage.js

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ color: '#bb86fc' }}
      >
        Welcome to the AI Assistant
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
        <Button
          variant="contained"
          component={Link}
          to="/chat"
          sx={{
            backgroundColor: '#bb86fc',
            '&:hover': {
              backgroundColor: '#9a67ea',
            },
            color: '#ffffff',
            padding: '16px 24px',
            fontSize: '1rem',
          }}
        >
          Chat Interface
        </Button>
        <Button
          variant="contained"
          component={Link}
          to="/speak"
          sx={{
            backgroundColor: '#bb86fc',
            '&:hover': {
              backgroundColor: '#9a67ea',
            },
            color: '#ffffff',
            padding: '16px 24px',
            fontSize: '1rem',
          }}
        >
          Voice Interface
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
