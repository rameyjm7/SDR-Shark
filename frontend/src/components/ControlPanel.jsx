import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, IconButton, Tabs, Tab } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import SDRSettings from './ControlPanel/SDRSettings';
import PlotSettings from './ControlPanel/PlotSettings';
import WaterfallSettings from './ControlPanel/WaterfallSettings';
import SweepSettings from './ControlPanel/SweepSettings';
import debounce from 'lodash/debounce';
import '../App.css';
import Analysis from './Analysis';

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
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!settingsLoaded) {
      fetchSettings();
    }
  }, [settingsLoaded]);

  useEffect(() => {
    updateSettings(localSettings);
  }, [localSettings]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/get_settings');
      const data = response.data;
      setSdr(data.sdr);
      console.log(data);
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
        lockBandwidthSampleRate: data.lockBandwidthSampleRate,
        numTicks: data.numTicks || 5, // Add numTicks to settings
        peakThreshold: data.peakThreshold || -25
      });
      setUpdateInterval(data.updateInterval);
      setWaterfallSamples(data.waterfallSamples);
      setMinY(minY);  // Initialize minY from fetched settings
      setMaxY(maxY);  // Initialize maxY from fetched settings
      setStatus('Settings loaded');
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setStatus('Error fetching settings');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.post('/api/update_settings', newSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings(newSettings);
      setStatus('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  };

  useEffect(() => {
    if (settings.sdr === 'sidekiq') {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        bandwidth: 60,
        sampleRate: 60,
      }));
    } else {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        bandwidth: 20,
        sampleRate: 20,
      }));
    }
  }, [settings.sdr]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...localSettings, [name]: newValue };
    setLocalSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    console.log(`${name} changed to: ${value}`);  // Log the slider changes
    const newSettings = { ...localSettings, [name]: value };
    setLocalSettings(newSettings);
    if (name === 'averagingCount') {
      debouncedApplySettings(newSettings);
    }
  };

  const handleSliderChangeCommitted = (e, value, name) => {
    console.log(`${name} change committed with value: ${value}`);  // Log the committed changes
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
      gain: { min: 0, max: 76 },
      sampleRate: { min: 0.233, max: 61.233 },
      bandwidth: { min: 0.233, max: 61.233 },
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box className="control-panel">
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="SDR" />
        <Tab label="Plot" />
        <Tab label="Analysis" />
      </Tabs>
      <Box className="control-panel-tab-content">
        {tabIndex === 0 && (
          <>
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
            <Typography variant="body1">Select SDR:</Typography>
            <Select value={sdr} onChange={handleSdrChange} fullWidth>
              <MenuItem value="hackrf">HackRF</MenuItem>
              <MenuItem value="sidekiq">Sidekiq</MenuItem>
            </Select>
            <SDRSettings settings={localSettings} handleChange={handleChange} handleKeyPress={handleKeyPress} />
            <SweepSettings settings={localSettings} setSettings={setLocalSettings} status={status} setStatus={setStatus} />
          </>
        )}
        {tabIndex === 1 && (
          <>
            <PlotSettings
              settings={localSettings}
              handleSliderChange={handleSliderChange}
              handleSliderChangeCommitted={handleSliderChangeCommitted}
              handleChange={handleChange}
              minY={minY}
              setMinY={(value) => { console.log(`Min Y-Axis changed to: ${value} dB`); setMinY(value); }}
              maxY={maxY}
              setMaxY={(value) => { console.log(`Max Y-Axis changed to: ${value} dB`); setMaxY(value); }}
            />
            <WaterfallSettings
              settings={localSettings}
              showWaterfall={showWaterfall}
              setShowWaterfall={setShowWaterfall}
            />
          </>
        )}
        {tabIndex === 2 && (
          <Analysis settings={settings} setSettings={setSettings} />
        )}
      </Box>
    </Box>
  );
};

export default ControlPanel;
