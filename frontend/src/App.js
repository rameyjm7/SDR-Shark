import React, { useState, useRef } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  CssBaseline,
  Typography,
  Grid,
  AppBar,
  Toolbar,
} from '@mui/material';
import theme from './theme';
import ControlPanel from './components/ControlPanel';

function App() {
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [settings, setSettings] = useState({
    frequency: 102.1,  // Default values in MHz and dB
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
    averagingCount: 20,
    peakDetection: false,
    numberOfPeaks: 5,
  });

  const chartRef = useRef(null);

  const updateSettings = async () => {
    try {
      const response = await axios.post('/api/update_settings', settings);
      console.log('Settings updated:', response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings();
  };

  const handleSliderChange = (name) => (e, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Spectrum Viewer
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Grid container spacing={2} style={{ marginTop: '16px' }}>
          <Grid item xs={9}>
            <div className="chart-container">
              <ChartComponent
                ref={chartRef}
                minY={minY}
                maxY={maxY}
                centerFreq={settings.frequency}
                sampleRate={settings.sampleRate}
              />
            </div>
          </Grid>
          <Grid item xs={3}>
            <ControlPanel
              settings={settings}
              minY={minY}
              maxY={maxY}
              peaks={[]}
              data={[]}
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
