import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import SDRSettings from './ControlPanel/SDRSettings';
import PlotSettings from './ControlPanel/PlotSettings';
import WaterfallSettings from './ControlPanel/WaterfallSettings';
import SweepSettings from './ControlPanel/SweepSettings';
import debounce from 'lodash/debounce';

const ControlPanel = ({
  settings,
  setSettings,
  minY,
  setMinY,
  maxY,
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
        updateInterval: data.updateInterval,
        waterfallSamples: data.waterfallSamples,
        frequency_start: data.frequency_start,
        frequency_stop: data.frequency_stop,
        sweeping_enabled: data.sweeping_enabled,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...localSettings, [name]: newValue };
    setLocalSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    const newSettings = { ...localSettings, [name]: value };
    setLocalSettings(newSettings);
    if (name === 'averagingCount') {
      debouncedApplySettings(newSettings);
    }
  };

  const handleSliderChangeCommitted = (e, value, name) => {
    if (name === 'averagingCount') {
      applySettings({ ...localSettings, [name]: value });
    }
  };

  const debouncedApplySettings = debounce((newSettings) => {
    applySettings(newSettings);
  }, 300);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applySettings(localSettings);
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

  const enforceLimits = (settings) => {
    const newSettings = { ...settings };
    const limitKeys = ['frequency', 'gain', 'sampleRate', 'bandwidth'];

    limitKeys.forEach((key) => {
      const limit = sdrLimits[sdr][key];
      if (newSettings[key] < limit.min) {
        newSettings[key] = limit.min;
      }
      if (newSettings[key] > limit.max) {
        newSettings[key] = limit.max;
      }
    });

    return newSettings;
  };

  const applySettings = async (newSettings) => {
    const enforcedSettings = enforceLimits(newSettings);
    setStatus('Updating settings...');
    try {
      await axios.post('/api/update_settings', enforcedSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings(enforcedSettings);
      setLocalSettings(enforcedSettings); // Update the local state with enforced settings
      setStatus('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  };

  const sdrLimits = {
    hackrf: {
      frequency: { min: 0, max: 7250 },
      gain: { min: 0, max: 61 },
      sampleRate: { min: 0, max: 20 },
      bandwidth: { min: 0, max: 20 },
    },
    sidekiq: {
      frequency: { min: 46.875, max: 6000 },
      gain: { min: 0, max: 40 },
      sampleRate: { min: 0.233, max: 61.233 },
      bandwidth: { min: 0.233, max: 61.233 },
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
      <Typography variant="body1">Select SDR:</Typography>
      <Select value={sdr} onChange={handleSdrChange} fullWidth>
        <MenuItem value="hackrf">HackRF</MenuItem>
        <MenuItem value="sidekiq">Sidekiq</MenuItem>
      </Select>
      <SDRSettings settings={localSettings} handleChange={handleChange} handleKeyPress={handleKeyPress} />
      <PlotSettings settings={localSettings} handleSliderChange={handleSliderChange} handleSliderChangeCommitted={handleSliderChangeCommitted} handleChange={handleChange} />
      <WaterfallSettings settings={localSettings} showWaterfall={showWaterfall} setShowWaterfall={setShowWaterfall} />
      <SweepSettings settings={localSettings} setSettings={setLocalSettings} status={status} setStatus={setStatus} />
    </Box>
  );
};

export default ControlPanel;
