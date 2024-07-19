import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import ControlPanel from './components/ControlPanel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tab,
  Tabs,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Slider // Add this line
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
  });
  const [updateInterval, setUpdateInterval] = useState(30);
  const [waterfallSamples, setWaterfallSamples] = useState(100);
  const [mainTabIndex, setMainTabIndex] = useState(0);
  const [controlPanelTabIndex, setControlPanelTabIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tuneSettings, setTuneSettings] = useState({ frequency: '', bandwidth: '' });
  const [showWaterfall, setShowWaterfall] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('/api/data');
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

  const handleMainTabChange = (event, newValue) => {
    setMainTabIndex(newValue);
  };

  const handleControlPanelTabChange = (event, newValue) => {
    setControlPanelTabIndex(newValue);
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

  const handleRowClick = (params, event) => {
    event.preventDefault();
    if (event.type === 'contextmenu') {
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              rowData: params.row,
            }
          : null,
      );
    }
  };

  const handleTuneToClick = () => {
    setTuneSettings({
      frequency: contextMenu.rowData.frequency,
      bandwidth: settings.bandwidth,
    });
    setDialogOpen(true);
    setContextMenu(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleTuneSettingsChange = (e) => {
    const { name, value } = e.target;
    setTuneSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleTuneSettingsSubmit = () => {
    updateSettings({
      ...settings,
      frequency: parseFloat(tuneSettings.frequency),
      bandwidth: parseFloat(tuneSettings.bandwidth),
    });
    setDialogOpen(false);
  };

  const columns = [
    { field: 'peak', headerName: 'Peak', width: 100 },
    { field: 'frequency', headerName: 'Frequency (MHz)', width: 180 },
    { field: 'power', headerName: 'Power (dB)', width: 140 },
    { field: 'classification', headerName: 'Classification', width: 150 },
  ];

  const rows = peaks.map((peak, index) => ({
    id: index,
    peak: `Peak ${index + 1}`,
    frequency: ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / data.length)).toFixed(2),
    power: data[peak]?.toFixed(2),
    classification: '???',
  }));

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
            {mainTabIndex === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <ChartComponent
                    settings={settings}
                    minY={minY}
                    maxY={maxY}
                    updateInterval={updateInterval}
                    waterfallSamples={waterfallSamples}
                    peaks={settings.peakDetection ? peaks : []}
                    showWaterfall={showWaterfall}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Tabs value={controlPanelTabIndex} onChange={handleControlPanelTabChange}>
                      <Tab label="Controls" />
                      <Tab label="Analysis" />
                    </Tabs>
                    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
                      {controlPanelTabIndex === 0 && (
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
                          showWaterfall={showWaterfall}
                          setShowWaterfall={setShowWaterfall}
                        />
                      )}
                      {controlPanelTabIndex === 1 && (
                        <Box>
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
                            <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                              <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={5}
                                onRowClick={handleRowClick}
                              />
                              <Menu
                                open={contextMenu !== null}
                                onClose={() => setContextMenu(null)}
                                anchorReference="anchorPosition"
                                anchorPosition={
                                  contextMenu !== null
                                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                    : undefined
                                }
                              >
                                <MenuItem onClick={handleTuneToClick}>Tune to</MenuItem>
                              </Menu>
                              <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                <DialogTitle>Tune to Peak</DialogTitle>
                                <DialogContent>
                                  <DialogContentText>
                                    Set the frequency and bandwidth to tune to this peak.
                                  </DialogContentText>
                                  <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Frequency (MHz)"
                                    name="frequency"
                                    type="number"
                                    value={tuneSettings.frequency}
                                    onChange={handleTuneSettingsChange}
                                    fullWidth
                                    variant="standard"
                                  />
                                  <TextField
                                    margin="dense"
                                    label="Bandwidth (MHz)"
                                    name="bandwidth"
                                    type="number"
                                    value={tuneSettings.bandwidth}
                                    onChange={handleTuneSettingsChange}
                                    fullWidth
                                    variant="standard"
                                  />
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={handleDialogClose}>Cancel</Button>
                                  <Button onClick={handleTuneSettingsSubmit}>Tune</Button>
                                </DialogActions>
                              </Dialog>
                            </Box>
                          )}
                          {settings.peakDetection && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="h6">Peak Detection</Typography>
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
                  </Box>
                </Grid>
              </Grid>
            )}
            {mainTabIndex === 1 && (
              <Box>
                {/* Actions content */}
              </Box>
            )}
            {mainTabIndex === 2 && (
              <Box>
                {/* File Manager content */}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
