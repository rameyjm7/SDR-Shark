import React, { useState } from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import ControlPanel from './ControlPanel';
import Analysis from './Analysis';

const Plots = () => {
  const [controlPanelTabIndex, setControlPanelTabIndex] = useState(0);
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
    peaks: []
  });
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);
  const [updateInterval, setUpdateInterval] = useState(30);
  const [waterfallSamples, setWaterfallSamples] = useState(100);
  const [showWaterfall, setShowWaterfall] = useState(true);
  const [peaks, setPeaks] = useState([]);
  const [time, setTime] = useState('');

  const handleControlPanelTabChange = (event, newValue) => {
    setControlPanelTabIndex(newValue);
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await axios.post('/api/update_settings', newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
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
          setPeaks={setPeaks}
          setTime={setTime}
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
                setSettings={updateSettings}
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
            {controlPanelTabIndex === 1 && <Analysis settings={settings} setSettings={setSettings} />}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Plots;
