import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, FormControlLabel, Switch, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import debounce from 'lodash/debounce';

const SweepSettings = ({ settings, setSettings, status, setStatus }) => {
  const [localSettings, setLocalSettings] = useState({
    frequency_start: settings.frequency_start || 0,
    frequency_stop: settings.frequency_stop || 0,
    sweeping_enabled: settings.sweeping_enabled || false,
  });

  useEffect(() => {
    setLocalSettings({
      frequency_start: settings.frequency_start,
      frequency_stop: settings.frequency_stop,
      sweeping_enabled: settings.sweeping_enabled,
    });
  }, [settings]);

  const handleSweepChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...localSettings, [name]: newValue };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    const newSettings = { ...localSettings, [name]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const updateSettings = debounce(async (newSettings) => {
    setStatus('Updating settings...');
    try {
      await axios.post('/api/update_settings', {
        ...settings,
        frequency_start: newSettings.frequency_start,
        frequency_stop: newSettings.frequency_stop,
        sweeping_enabled: newSettings.sweeping_enabled,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings((prevSettings) => ({
        ...prevSettings,
        frequency_start: newSettings.frequency_start,
        frequency_stop: newSettings.frequency_stop,
        sweeping_enabled: newSettings.sweeping_enabled,
      }));
      setStatus('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  }, 300);

  return (
    <Box>
      <Typography variant="h6">Sweep Settings</Typography>
      <TextField
        fullWidth
        margin="dense"
        label="Sweep Start Frequency (MHz)"
        name="frequency_start"
        type="number"
        value={localSettings.frequency_start}
        onChange={handleSweepChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Sweep Stop Frequency (MHz)"
        name="frequency_stop"
        type="number"
        value={localSettings.frequency_stop}
        onChange={handleSweepChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={localSettings.sweeping_enabled}
            onChange={handleSweepChange}
            name="sweeping_enabled"
            color="primary"
          />
        }
        label="Enable Sweep"
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
            Status: {status}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => updateSettings(localSettings)} sx={{ ml: 2 }}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SweepSettings;
