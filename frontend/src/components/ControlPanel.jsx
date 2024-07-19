import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
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

  const updateSettings = async (newSettings) => {
    try {
      await axios.post('/api/update_settings', newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  useEffect(() => {
    updateSettings(settings);
  }, []);

  return (
    <Box>
      <Typography variant="h6">SDR Settings</Typography>
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
        inputProps={{ step: 0.1 }}
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
        inputProps={{ step: 1 }}
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
        inputProps={{ step: 0.1 }}
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
        inputProps={{ step: 0.1 }}
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
