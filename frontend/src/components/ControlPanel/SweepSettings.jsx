import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';

const SweepSettings = ({ settings, setSettings, setStatus }) => {
  const [localSettings, setLocalSettings] = useState({
    frequency_start: settings.frequency_start,
    frequency_stop: settings.frequency_stop,
    bandwidth: settings.sdr === 'sidekiq' ? 60 : 20,
    sweeping_enabled: settings.sweeping_enabled,
  });

  useEffect(() => {
    setLocalSettings({
      frequency_start: settings.frequency_start,
      frequency_stop: settings.frequency_stop,
      bandwidth: settings.sdr === 'sidekiq' ? 60 : 20,
      sweeping_enabled: settings.sweeping_enabled,
    });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }));

    if (name === 'sweeping_enabled') {
      updateSweepingEnabled(newValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applySettings();
    }
  };

  const updateSweepingEnabled = async (sweepingEnabled) => {
    setStatus('Updating settings...');
    try {
      const newSettings = {
        ...settings,
        sweeping_enabled: sweepingEnabled,
      };

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

  const applySettings = async () => {
    setStatus('Updating settings...');
    try {
      const newSettings = {
        ...settings,
        frequency_start: localSettings.frequency_start,
        frequency_stop: localSettings.frequency_stop,
        bandwidth: settings.sdr === 'sidekiq' ? 60 : 20, // Ensure bandwidth is always set based on SDR
        sweeping_enabled: localSettings.sweeping_enabled,
      };

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

  const totalBandwidth = localSettings.frequency_stop - localSettings.frequency_start;
  const sweepSteps = totalBandwidth / localSettings.bandwidth;

  return (
    <Box>
      <Typography variant="h6">Sweep Settings</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={localSettings.sweeping_enabled}
            onChange={handleChange}
            name="sweeping_enabled"
            color="primary"
          />
        }
        label="Enable Sweep"
      />
      <Box display="flex" justifyContent="space-between">
        <TextField
          margin="dense"
          label="Start Frequency (MHz)"
          name="frequency_start"
          type="number"
          value={localSettings.frequency_start}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1 }}
        />
        <TextField
          margin="dense"
          label="Stop Frequency (MHz)"
          name="frequency_stop"
          type="number"
          value={localSettings.frequency_stop}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1 }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between">
        <TextField
          margin="dense"
          label="Total Bandwidth (MHz)"
          name="total_bandwidth"
          type="number"
          value={totalBandwidth}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1, readOnly: true }}
          disabled
        />
        <TextField
          margin="dense"
          label="Sweep Steps"
          name="sweep_steps"
          type="number"
          value={sweepSteps}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 1, readOnly: true }}
          disabled
        />
      </Box>
    </Box>
  );
};

export default SweepSettings;
