import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import './App.css';
import 'chart.js/auto';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container,
  CssBaseline,
  Typography,
  TextField,
  Button,
  Slider,
  Box,
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
  const [settings, setSettings] = useState({
    frequency: 102.1,  // Default values in MHz and dB
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios('/api/data');
        setData(result.data.fft || []);
        setTime(result.data.time);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    };

    const interval = setInterval(fetchData, 33.33); // fetch new data every 30ms (30Hz)
    return () => clearInterval(interval); // cleanup
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
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
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

  const chartData = {
    labels: data.map((_, index) => index),
    datasets: [
      {
        label: 'FFT Data',
        data: data,
        fill: false,
        backgroundColor: 'yellow',
        borderColor: 'orange',
      },
    ],
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>FFT and Current Time</Typography>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <Typography variant="h6">Current Time: {time}</Typography>
            <div className="chart-container">
              <ChartComponent data={chartData} minY={minY} maxY={maxY} />
            </div>
          </Grid>
          <Grid item xs={3}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Frequency (MHz)"
                name="frequency"
                type="number"
                value={settings.frequency}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 0.1 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Gain (dB)"
                name="gain"
                type="number"
                value={settings.gain}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 1 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Sample Rate (MHz)"
                name="sampleRate"
                type="number"
                value={settings.sampleRate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 0.1 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Bandwidth (MHz)"
                name="bandwidth"
                type="number"
                value={settings.bandwidth}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 0.1 }}
              />
              <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                Update Settings
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Min Y: {minY}</Typography>
              <Slider
                min={-60}
                max={-20}
                value={minY}
                onChange={(e, value) => setMinY(value)}
                valueLabelDisplay="auto"
              />
              <Typography gutterBottom>Max Y: {maxY}</Typography>
              <Slider
                min={20}
                max={60}
                value={maxY}
                onChange={(e, value) => setMaxY(value)}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
