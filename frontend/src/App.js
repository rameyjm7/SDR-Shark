import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container,
  CssBaseline,
  Typography,
  TextField,
  Button,
  Slider,
  Box,
  Grid,
  AppBar,
  Toolbar,
  Paper,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  const [settings, setSettings] = useState({
    frequency: 102.1,  // Default values in MHz and dB
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
    averagingCount: 20,
    peakDetection: false,
    numberOfPeaks: 5,
  });
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [updateInterval, setUpdateInterval] = useState(100); // Default update interval in ms
  const [waterfallSamples, setWaterfallSamples] = useState(25); // Default number of samples in the waterfall plot
  const [showColorWheel, setShowColorWheel] = useState(true); // Default to show the color wheel
  const [peaks, setPeaks] = useState([]);
  const [fftData, setFftData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        setFftData(response.data.fft);
        setPeaks(response.data.peaks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

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

  const handleUpdateIntervalChange = (e, value) => {
    setUpdateInterval(value);
  };

  const handleWaterfallSamplesChange = (e, value) => {
    setWaterfallSamples(value);
  };

  const handleColorWheelChange = (e) => {
    setShowColorWheel(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings();
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
                settings={settings}
                minY={minY}
                maxY={maxY}
                updateInterval={updateInterval}
                waterfallSamples={waterfallSamples}
                showColorWheel={showColorWheel}
                peaks={peaks}
              />
            </div>
          </Grid>
          <Grid item xs={3}>
            <Paper elevation={3} sx={{ padding: 2 }}>
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
                <TextField
                  fullWidth
                  margin="dense"
                  label="Averaging Count"
                  name="averagingCount"
                  type="number"
                  value={settings.averagingCount}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.peakDetection}
                      onChange={handleChange}
                      name="peakDetection"
                      color="primary"
                    />
                  }
                  label="Enable Peak Detection"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showColorWheel}
                      onChange={handleColorWheelChange}
                      name="showColorWheel"
                      color="primary"
                    />
                  }
                  label="Show Color Wheel"
                />
                <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                  Update Settings
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Update Interval (ms): {updateInterval}</Typography>
                <Slider
                  min={10}
                  max={1000}
                  value={updateInterval}
                  onChange={handleUpdateIntervalChange}
                  valueLabelDisplay="auto"
                />
                <Typography gutterBottom>Waterfall Samples: {waterfallSamples}</Typography>
                <Slider
                  min={1}
                  max={100}
                  value={waterfallSamples}
                  onChange={handleWaterfallSamplesChange}
                  valueLabelDisplay="auto"
                />
                <Typography gutterBottom>Min Y: {minY}</Typography>
                <Slider
                  min={-60}
                  max={20}
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
              {settings.peakDetection && peaks.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Peak</TableCell>
                        <TableCell>Frequency (MHz)</TableCell>
                        <TableCell>Amplitude (dB)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {peaks.map((peak, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2)}</TableCell>
                          <TableCell>{fftData[peak]?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
