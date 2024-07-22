import React from 'react';
import { Box, Typography, TextField, Select, MenuItem, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';

const SDRSettings = ({ sdr, setSdr, localSettings, handleChange, handleKeyPress, handleSdrChange, applySettings, status, fetchSettings }) => {
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
      />
    </Box>
  );
};

export default SDRSettings;
