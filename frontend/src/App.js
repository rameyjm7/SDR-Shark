import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import ControlPanel from './components/ControlPanel';
import './App.css';
import 'chart.js/auto';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container,
  CssBaseline,
  Typography,
  Grid,
  AppBar,
  Toolbar,
} from '@mui/material';

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
  const [data, setData] = useState([]);
  const [time, setTime] = useState('');
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [peaks, setPeaks] = useState([]);
  const [settings, setSettings] = useState({
    frequency: 102.1,  // Default values in MHz and dB
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
    averagingCount: 20,
    peakDetection: false,
    numberOfPeaks: 5,
    throttleInterval: 10,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSliderChange = (name) => (e, value) => {
    if (name === 'minY') {
      setMinY(value);
    } else if (name === 'maxY') {
      setMaxY(value);
    }
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/update_settings', settings);
      console.log('Settings updated:', response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Spectrum Viewer
          </Typography>
          <Typography variant="h6">
            {time}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Grid container spacing={2} style={{ marginTop: '16px' }}>
          <Grid item xs={9}>
            <div className="chart-container">
              <ChartComponent settings={{ ...settings, minY, maxY }} />
            </div>
          </Grid>
          <Grid item xs={3}>
            <ControlPanel
              settings={settings}
              minY={minY}
              maxY={maxY}
              peaks={peaks}
              data={data}
              handleChange={handleChange}
              handleSliderChange={handleSliderChange}
              handleSubmit={handleSubmit}
            />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
