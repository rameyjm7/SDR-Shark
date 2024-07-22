import React, { useState, useEffect } from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch, TextField, Select, MenuItem, Button, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
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
  const [sweepSettings, setSweepSettings] = useState({
    frequencyStart: '',
    frequencyStop: '',
    bandwidth: '',
  });
  const [sweepingEnabled, setSweepingEnabled] = useState(false);

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

  const startSweep = async () => {
    setStatus('Starting sweep...');
    try {
      await axios.post('/api/start_sweep', sweepSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSweepingEnabled(true);
      setStatus('Sweep started');
    } catch (error) {
      console.error('Error starting sweep:', error);
      setStatus('Error starting sweep');
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
      <TextField
        fullWidth
        margin="dense"
        label="Frequency (MHz)"
        name="frequency"
        type="number"
        value={localSettings.frequency}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={sweepingEnabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Gain (dB)"
        name="gain"
        type="number"
        value={localSettings.gain}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 1 }}
        disabled={sweepingEnabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Sample Rate (MHz)"
        name="sampleRate"
        type="number"
        value={localSettings.sampleRate}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={sweepingEnabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Bandwidth (MHz)"
        name="bandwidth"
        type="number"
        value={localSettings.bandwidth}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={sweepingEnabled}
      />
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>
      <Typography gutterBottom>Averaging Count: {localSettings.averagingCount}</Typography>
      <Slider
        min={1}
        max={100}
        value={localSettings.averagingCount}
        onChange={(e, value) => handleSliderChange(e, value, 'averagingCount')}
        onChangeCommitted={(e, value) => handleSliderChangeCommitted(e, value, 'averagingCount')}
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
            checked={localSettings.dcSuppress}
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
              const newSettings = { ...localSettings, showWaterfall: !showWaterfall };
              setLocalSettings(newSettings);
              applySettings(newSettings);
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
      <Typography variant="h6" sx={{ mt: 2 }}>Sweep Settings</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={sweepingEnabled}
            onChange={(e) => setSweepingEnabled(e.target.checked)}
            name="sweepingEnabled"
            color="primary"
          />
        }
        label="Enable Sweeping"
      />
      <TextField
        fullWidth
        margin="dense"
        label="Start Frequency (MHz)"
        name="frequencyStart"
        type="number"
        value={sweepSettings.frequencyStart}
        onChange={(e) => setSweepSettings({ ...sweepSettings, frequencyStart: e.target.value })}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={!sweepingEnabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Stop Frequency (MHz)"
        name="frequencyStop"
        type="number"
        value={sweepSettings.frequencyStop}
        onChange={(e) => setSweepSettings({ ...sweepSettings, frequencyStop: e.target.value })}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={!sweepingEnabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Bandwidth (MHz)"
        name="bandwidth"
        type="number"
        value={sweepSettings.bandwidth}
        onChange={(e) => setSweepSettings({ ...sweepSettings, bandwidth: e.target.value })}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={!sweepingEnabled}
      />
      <Button variant="contained" color="primary" onClick={startSweep} disabled={!sweepingEnabled}>
        Start Sweep
      </Button>
    </Box>
  );
};

export default ControlPanel;
