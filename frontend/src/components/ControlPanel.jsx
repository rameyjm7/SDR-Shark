import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import SDRSettings from './ControlPanel/SDRSettings';
import PlotSettings from './ControlPanel/PlotSettings';
import WaterfallSettings from './ControlPanel/WaterfallSettings';
import SweepSettings from './ControlPanel/SweepSettings';

const ControlPanel = ({
  settings,
  setSettings,
  minY,
  setMinY,
  maxY,
  setMaxY,
  updateInterval,
  setUpdateInterval,
  waterfallSamples,
  setWaterfallSamples,
  showWaterfall,
  setShowWaterfall,
}) => {
  const [sdr, setSdr] = useState(settings.sdr || 'hackrf');
  const [status, setStatus] = useState('Ready');
  const [localSettings, setLocalSettings] = useState(settings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!settingsLoaded) {
      fetchSettings();
    }
  }, [settingsLoaded]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/get_settings');
      const data = response.data;
      setSdr(data.sdr);
      setLocalSettings({
        frequency: data.frequency,
        gain: data.gain,
        sampleRate: data.sampleRate,
        bandwidth: data.bandwidth,
        averagingCount: data.averagingCount,
        dcSuppress: data.dcSuppress,
        showWaterfall: data.showWaterfall,
        sweepingEnabled: data.sweepingEnabled,
        frequencyStart: data.frequencyStart,
        frequencyStop: data.frequencyStop,
      });
      setUpdateInterval(data.updateInterval);
      setWaterfallSamples(data.waterfallSamples);
      setStatus('Settings loaded');
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setStatus('Error fetching settings');
    }
  };

  const handleSdrChange = (e) => {
    const newSdr = e.target.value;
    setSdr(newSdr);
    setStatus(`Changing SDR to ${newSdr}...`);
    axios.post('/api/select_sdr', { sdr_name: newSdr })
      .then(response => {
        console.log('SDR changed:', response.data);
        const newSettings = { ...localSettings, sdr: newSdr };
        setLocalSettings(newSettings);
        applySettings(newSettings);
        setStatus(`SDR changed to ${newSdr}`);
      })
      .catch(error => {
        console.error('Error changing SDR:', error);
        setStatus('Error changing SDR');
      });
  };

  const applySettings = async (newSettings) => {
    setStatus('Updating settings...');
    try {
      await axios.post('/api/update_settings', newSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings(newSettings);
      setLocalSettings(newSettings); // Update the local state with enforced settings
      setStatus('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">SDR Settings</Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
              Status: {status}
            </Typography>
            <IconButton onClick={fetchSettings} sx={{ ml: 2 }}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => applySettings(localSettings)} sx={{ ml: 2 }}>
              <SaveIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <SDRSettings
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
        handleSdrChange={handleSdrChange}
        sdr={sdr}
      />
      <PlotSettings
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
      />
      <WaterfallSettings
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
        waterfallSamples={waterfallSamples}
        setWaterfallSamples={setWaterfallSamples}
        showWaterfall={showWaterfall}
        setShowWaterfall={setShowWaterfall}
      />
      <SweepSettings
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
        status={status}
        setStatus={setStatus}
      />
    </Box>
  );
};

export default ControlPanel;
