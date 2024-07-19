import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import ControlPanel from './components/ControlPanel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  FormControlLabel,
  Paper,
  Slider,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Grid,
} from '@mui/material';
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
  const [data, setData] = useState([]);
  const [time, setTime] = useState('');
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [peaks, setPeaks] = useState([]);
  const [settings, setSettings] = useState({
    frequency: 102.1,
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
    averagingCount: 20,
    dcSuppress: true,
    peakDetection: false,
    minPeakDistance: 0.25,
    numberOfPeaks: 5,
    throttleInterval: 10,
  });
  const [updateInterval, setUpdateInterval] = useState(30);
  const [waterfallSamples, setWaterfallSamples] = useState(100);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios('/api/data');
        setData(result.data.fft || []);
        setPeaks(result.data.peaks || []);
        setTime(result.data.time);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
        setPeaks([]);
      }
    };

    const interval = setInterval(fetchData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.post('/api/update_settings', newSettings);
      setSettings(newSettings);
      console.log('Settings updated:', response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSliderChange = (e, value, name) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Typography variant="h6" sx={{ flexGrow: 1, padding: 2 }}>
          Spectrum Viewer
        </Typography>
      </AppBar>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={9}>
          <ChartComponent
            data={data}
            settings={settings}
            minY={minY}
            maxY={maxY}
            peaks={settings.peakDetection ? peaks : []}
          />
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Settings" />
              <Tab label="Analysis" />
            </Tabs>
          </Box>
          <Box sx={{ p: 3 }}>
            {tabIndex === 0 && (
              <ControlPanel
                settings={settings}
                setSettings={setSettings}
                updateSettings={updateSettings}
                minY={minY}
                setMinY={setMinY}
                maxY={maxY}
                setMaxY={setMaxY}
                updateInterval={updateInterval}
                setUpdateInterval={setUpdateInterval}
                waterfallSamples={waterfallSamples}
                setWaterfallSamples={setWaterfallSamples}
                fftData={data}
                peaks={peaks}
              />
            )}
            {tabIndex === 1 && (
              <Box>
                {settings.peakDetection && peaks.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableBody>
                        {peaks.map((peak, index) => (
                          <TableRow key={index}>
                            <TableCell>{`Peak ${index + 1}`}</TableCell>
                            <TableCell>{`${((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / data.length)).toFixed(2)} MHz`}</TableCell>
                            <TableCell>{`${data[peak]?.toFixed(2)} dB`}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <Typography variant="h6" sx={{ mt: 2 }}>Peak Detection</Typography>
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
                {settings.peakDetection && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Min Distance Between Peaks (MHz): {settings.minPeakDistance}</Typography>
                    <Slider
                      min={0.01}
                      max={1.0}
                      value={settings.minPeakDistance}
                      onChange={(e, value) => handleSliderChange(e, value, 'minPeakDistance')}
                      valueLabelDisplay="auto"
                      step={0.01}
                      marks={[
                        { value: 0.01, label: '0.01 MHz' },
                        { value: 0.5, label: '0.5 MHz' },
                        { value: 1.0, label: '1 MHz' }
                      ]}
                    />
                    <Typography gutterBottom>Number of Peaks: {settings.numberOfPeaks}</Typography>
                    <Slider
                      min={1}
                      max={20}
                      value={settings.numberOfPeaks}
                      onChange={(e, value) => handleSliderChange(e, value, 'numberOfPeaks')}
                      valueLabelDisplay="auto"
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 10, label: '10' },
                        { value: 20, label: '20' }
                      ]}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
