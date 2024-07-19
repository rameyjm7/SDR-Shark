import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import ControlPanel from './components/ControlPanel';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import theme from './theme';

function App() {
  const [settings, setSettings] = useState({
    frequency: 102.1,
    gain: 30,
    sampleRate: 16,
    bandwidth: 16,
    averagingCount: 20,
    peakDetection: false,
    numberOfPeaks: 5,
    dcSuppress: true,
  });
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [updateInterval, setUpdateInterval] = useState(100);
  const [waterfallSamples, setWaterfallSamples] = useState(25);
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

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.post('/api/update_settings', newSettings);
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
                peaks={peaks}
              />
            </div>
          </Grid>
          <Grid item xs={3}>
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
              fftData={fftData}
              peaks={peaks}
            />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
