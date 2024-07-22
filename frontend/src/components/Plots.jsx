import React, { useState } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import ControlPanel from './ControlPanel';
import '../App.css';

const Plots = () => {
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

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await axios.post('/api/update_settings', newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="plots_container">
      <Box className="plots">
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
      </Box>
      <Box className="control-panel">
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
      </Box>
    </div>
  );
};

export default Plots;
