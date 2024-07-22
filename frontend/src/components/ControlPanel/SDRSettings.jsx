import React from 'react';
import { Box, TextField, FormControlLabel, Switch, Grid } from '@mui/material';

const SDRSettings = ({ settings, handleChange, handleKeyPress }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            margin="dense"
            label="Frequency (MHz)"
            name="frequency"
            type="number"
            value={settings.frequency}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
          />
        </Grid>
        <Grid item xs={6}>
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
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
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
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            margin="dense"
            label="Bandwidth (MHz)"
            name="bandwidth"
            type="number"
            value={settings.sweeping_enabled ? (settings.sdr === 'sidekiq' ? 60 : 20) : settings.bandwidth}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            disabled={settings.sweeping_enabled}
          />
        </Grid>
      </Grid>
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
