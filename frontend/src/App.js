import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Tab, Tabs, Typography } from '@mui/material';
import Plots from './components/Plots';
import Actions from './components/Actions';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000',
      paper: '#121212',
    },
    text: {
      primary: '#fff',
    },
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [mainTabIndex, setMainTabIndex] = useState(0);

  const handleMainTabChange = (event, newValue) => {
    setMainTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Typography variant="h6" sx={{ flexGrow: 1, padding: 2 }}>
          Spectrum Viewer
        </Typography>
      </AppBar>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs value={mainTabIndex} onChange={handleMainTabChange}>
            <Tab label="Plots" />
            <Tab label="Actions" />
            <Tab label="File Manager" />
          </Tabs>
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {mainTabIndex === 0 && <Plots />}
            {mainTabIndex === 1 && <Actions />}
            {mainTabIndex === 2 && <Box>{/* File Manager content */}</Box>}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
