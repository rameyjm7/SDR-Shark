import React, { useState, useEffect } from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch, TextField, Select, MenuItem } from '@mui/material';
import axios from 'axios';

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

  useEffect(() => {
    const fetchSdr = async () => {
      try {
        const response = await axios.get('/api/get_sdr');
        setSdr(response.data.sdr);
      } catch (error) {
        console.error('Error fetching SDR:', error);
      }
    };
    fetchSdr();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...settings, [name]: newValue };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSdrChange = (e) => {
    const newSdr = e.target.value;
    setSdr(newSdr);
    setStatus(`Changing SDR to ${newSdr}...`);
    axios.post('/api/select_sdr', { sdr_name: newSdr })
      .then(response => {
        console.log('SDR changed:', response.data);
        setSettings({ ...settings, sdr: newSdr });
        setStatus(`SDR changed to ${newSdr}`);
      })
      .catch(error => {
        console.error('Error changing SDR:', error);
        setStatus('Error changing SDR');
      });
  };

  const updateSettings = async (newSettings) => {
    setStatus('Updating settings...');
    try {
      await axios.post('/api/update_settings', newSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
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

  const { frequency, gain, sampleRate, bandwidth } = sdrLimits[sdr];

  return (
    <Box>
      <Typography variant="h6">SDR Settings</Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Status: {status}
      </Typography>
      <Typography variant="body1">Select SDR:</Typography>
      <Select value={sdr} onChange={handleSdrChange} fullWidth>
        <MenuItem value="hackrf">HackRF</MenuItem>
        <MenuItem value="sidekiq">Sidekiq</MenuItem>
      </Select>
      <TextField
        fullWidth
        margin="dense"
        label="Frequency (MHz)"
        name="frequency"
        type="number"
        value={settings.frequency}
        onChange={handleChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1, min: frequency.min, max: frequency.max }}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Gain (dB)"
        name="gain"
        type="number"
        value={settings.gain}
        onChange={handleChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 1, min: gain.min, max: gain.max }}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Sample Rate (MHz)"
        name="sampleRate"
        type="number"
        value={settings.sampleRate}
        onChange={handleChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1, min: sampleRate.min, max: sampleRate.max }}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Bandwidth (MHz)"
        name="bandwidth"
        type="number"
        value={settings.bandwidth}
        onChange={handleChange}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1, min: bandwidth.min, max: bandwidth.max }}
      />
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>
      <Typography gutterBottom>Averaging Count: {settings.averagingCount}</Typography>
      <Slider
        min={1}
        max={100}
        value={settings.averagingCount}
        onChange={(e, value) => handleSliderChange(e, value, 'averagingCount')}
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: 1, label: '1' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.dcSuppress}
            onChange={handleChange}
            name="dcSuppress"
            color="primary"
          />
        }
        label="Suppress DC Spike"
      />
      <FormControlLabel
        control={
          <Switch
            checked={showWaterfall}
            onChange={() => {
              setShowWaterfall(!showWaterfall);
              const newSettings = { ...settings, showWaterfall: !showWaterfall };
              setSettings(newSettings);
              updateSettings(newSettings);
            }}
            name="showWaterfall"
            color="primary"
          />
        }
        label="Enable Waterfall"
      />
      <Typography variant="h6" sx={{ mt: 2 }}>Waterfall Settings</Typography>
      <Typography gutterBottom>Update Interval (ms): {updateInterval}</Typography>
      <Slider
        min={10}
        max={1000}
        value={updateInterval}
        onChange={(e, value) => setUpdateInterval(value)}
        valueLabelDisplay="auto"
        step={10}
        marks={[
          { value: 10, label: '10 ms' },
          { value: 500, label: '500 ms' },
          { value: 1000, label: '1000 ms' },
        ]}
      />
      <Typography gutterBottom>Waterfall Samples: {waterfallSamples}</Typography>
      <Slider
        min={25}
        max={1000}
        value={waterfallSamples}
        onChange={(e, value) => setWaterfallSamples(value)}
        valueLabelDisplay="auto"
        step={25}
        marks={[
          { value: 25, label: '25' },
          { value: 500, label: '500' },
          { value: 1000, label: '1000' },
        ]}
      />
    </Box>
  );
};

export default ControlPanel;
