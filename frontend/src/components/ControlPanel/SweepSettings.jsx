import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, IconButton, FormControlLabel, Switch } from '@mui/material';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';

const SweepSettings = ({ localSettings, setLocalSettings, status, setStatus }) => {
  const [sweepingEnabled, setSweepingEnabled] = useState(localSettings.sweepingEnabled || false);
  const [frequencyStart, setFrequencyStart] = useState(localSettings.frequencyStart || 50);
  const [frequencyStop, setFrequencyStop] = useState(localSettings.frequencyStop || 6000);
  const [bandwidth, setBandwidth] = useState(localSettings.bandwidth || 10);

  useEffect(() => {
    if (localSettings.sweepingEnabled !== sweepingEnabled) {
      setSweepingEnabled(localSettings.sweepingEnabled);
    }
    if (localSettings.frequencyStart !== frequencyStart) {
      setFrequencyStart(localSettings.frequencyStart);
    }
    if (localSettings.frequencyStop !== frequencyStop) {
      setFrequencyStop(localSettings.frequencyStop);
    }
    if (localSettings.bandwidth !== bandwidth) {
      setBandwidth(localSettings.bandwidth);
    }
  }, [localSettings]);

  const handleSweepChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...localSettings, [name]: newValue };
    setLocalSettings(newSettings);
  };

  const startSweep = async () => {
    setStatus('Starting sweep...');
    try {
      await axios.post('/api/start_sweep', {
        frequencyStart,
        frequencyStop,
        bandwidth,
      });
      setStatus('Sweep started');
    } catch (error) {
      console.error('Error starting sweep:', error);
      setStatus('Error starting sweep');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      startSweep();
    }
  };

  return (
    <Box>
      <Typography variant="h6">Sweep Settings</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={sweepingEnabled}
            onChange={handleSweepChange}
            name="sweepingEnabled"
            color="primary"
          />
        }
        label="Enable Sweep"
      />
      <TextField
        fullWidth
        margin="dense"
        label="Start Frequency (MHz)"
        name="frequencyStart"
        type="number"
        value={frequencyStart}
        onChange={handleSweepChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Stop Frequency (MHz)"
        name="frequencyStop"
        type="number"
        value={frequencyStop}
        onChange={handleSweepChange}
        onKeyPress={handleKeyPress}
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
        value={bandwidth}
        onChange={handleSweepChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
        <IconButton onClick={startSweep} sx={{ ml: 2 }}>
          <SaveIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SweepSettings;
