import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import PlotSettings from './ControlPanel/PlotSettings';
import '../App.css';

const Plots = ({ settings, updateInterval, showSecondTrace, waterfallSamples, showWaterfall, minY, maxY, setMinY, setMaxY }) => {
  const [sweepSettings, setSweepSettings] = useState({
    frequency_start: 100,
    frequency_stop: 200,
    sweeping_enabled: false,
    bandwidth: 16,
  });

  useEffect(() => {
    fetchInitialSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialSettings = async () => {
    try {
      console.log("Fetching initial settings...");
      const response = await axios.get('/api/get_settings');
      const data = response.data;
      console.log("Initial settings fetched:", data);

      setSweepSettings({
        frequency_start: data.frequency_start,
        frequency_stop: data.frequency_stop,
        sweeping_enabled: data.sweeping_enabled,
        bandwidth: data.sweeping_enabled ? data.frequency_stop - data.frequency_start : data.bandwidth,
      });
    } catch (error) {
      console.error('Error fetching initial settings:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/get_settings');
      const data = response.data;
      setSweepSettings({
        frequency_start: data.frequency_start,
        frequency_stop: data.frequency_stop,
        sweeping_enabled: data.sweeping_enabled,
        bandwidth: data.sweeping_enabled ? data.frequency_stop - data.frequency_start : data.bandwidth,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      console.log("Updating settings with:", newSettings);
      await axios.post('/api/update_settings', newSettings);
      console.log("Settings updated successfully.");
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="plots_container">
      <Box className="plots">
        <ChartComponent
          settings={settings}
          sweepSettings={sweepSettings}
          setSweepSettings={setSweepSettings}
          minY={minY}
          maxY={maxY}
          updateInterval={updateInterval}
          waterfallSamples={waterfallSamples}
          showWaterfall={showWaterfall}
          showSecondTrace={showSecondTrace}
        />
      </Box>
    </div>
  );
};

export default Plots;
