import React from 'react';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

const SDRSettings = ({ settings, handleChange, handleKeyPress }) => {
  const totalBandwidth = settings.frequency_stop - settings.frequency_start;
  const centerFrequency = (settings.frequency_start + settings.frequency_stop) / 2;

  return (
    <Box>
      <TextField
        fullWidth
        margin="dense"
        label="Frequency (MHz)"
        name="frequency"
        type="number"
        value={settings.sweeping_enabled ? centerFrequency : settings.frequency}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={settings.sweeping_enabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Gain (dB)"
        name="gain"
        type="number"
        value={settings.gain}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
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
        value={settings.sweeping_enabled ? (settings.sdr === 'sidekiq' ? 60 : 20) : settings.sampleRate}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={settings.sweeping_enabled}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Bandwidth (MHz)"
        name="bandwidth"
        type="number"
        value={settings.sweeping_enabled ? totalBandwidth : settings.bandwidth}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 0.1 }}
        disabled={settings.sweeping_enabled}
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
    </Box>
  );
};

export default SDRSettings;
