import React, { useEffect, useState, useRef } from 'react';
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
  AppBar,
  Toolbar,
  Grid
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
  const eventSourceRef = useRef(null);

  useEffect(() => {
    eventSourceRef.current = new EventSource('/api/stream');

    eventSourceRef.current.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setData(parsedData.fft || []);
      setPeaks(parsedData.peaks || []);
      setTime(parsedData.time || '');
    };

    return () => {
      eventSourceRef.current.close();
    };
  }, []);

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

  const handleSliderChange = (name) => (e, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings();
  };

  const chartData = {
    labels: data.map((_, index) => index),
    datasets: [
      {
        label: 'FFT Data',
        data: data,
        fill: false,
        backgroundColor: 'yellow',
        borderColor: 'orange',
        pointRadius: 2,  // Smaller dots
      },
      ...peaks.map((peak, index) => ({
        label: `Peak ${index + 1}`,
        data: [{ x: peak.x, y: peak.y }],
        backgroundColor: 'red',
        borderColor: 'red',
        pointRadius: 5,
      })),
    ],
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
              <ChartComponent
                data={chartData}
                minY={minY}
                maxY={maxY}
                centerFreq={settings.frequency}
                sampleRate={settings.sampleRate}
                throttleInterval={settings.throttleInterval}
              />
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
