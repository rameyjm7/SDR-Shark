import React, { useEffect } from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography } from '@mui/material';

const SDRSettings = ({ settings, handleChange, handleKeyPress, setSettings }) => {
  const totalBandwidth = settings.frequency_stop - settings.frequency_start;
  const centerFrequency = (settings.frequency_start + settings.frequency_stop) / 2;

  // Ensure all settings have valid defaults to avoid uncontrolled to controlled warnings
  const frequency = settings.frequency || 0;
  const gain = settings.gain || 0;
  const sampleRate = settings.sampleRate || 0;
  const bandwidth = settings.bandwidth || 0;
  const lockBandwidthSampleRate = typeof settings.lockBandwidthSampleRate === 'boolean' ? settings.lockBandwidthSampleRate : false;
  const dcSuppress = typeof settings.dcSuppress === 'boolean' ? settings.dcSuppress : false;
  const showSecondTrace = typeof settings.showSecondTrace === 'boolean' ? settings.showSecondTrace : false;

  // Effect to handle bandwidth update when sample rate changes
  useEffect(() => {
    if (lockBandwidthSampleRate && bandwidth !== sampleRate) {
      handleChange({
        target: {
          name: 'bandwidth',
          value: sampleRate,
        },
      });
    }
  }, [sampleRate, lockBandwidthSampleRate, bandwidth, handleChange]);

  const handleSecondTraceToggle = (e) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      showSecondTrace: e.target.checked,
    }));
  };

  return (
    <Box>
      {/* SDR Settings Box */}
      <Box
        sx={{
          backgroundColor: 'inherit', // Same background color as the rest of the panel
          padding: 3, // Padding for spacing
          borderRadius: 2, // Rounded edges
          border: '2px solid white', // White border for distinction
          mt: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>SDR Settings</Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Frequency (MHz)"
            name="frequency"
            type="number"
            value={settings.sweeping_enabled ? centerFrequency : frequency}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            disabled={settings.sweeping_enabled}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            margin="dense"
            label="Gain (dB)"
            name="gain"
            type="number"
            value={gain}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 1 }}
            sx={{ flex: 1, ml: 2 }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Sample Rate (MHz)"
            name="sampleRate"
            type="number"
            value={settings.sweeping_enabled ? (settings.sdr === 'sidekiq' ? 60 : 20) : sampleRate}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            disabled={settings.sweeping_enabled}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            margin="dense"
            label="Bandwidth (MHz)"
            name="bandwidth"
            type="number"
            value={settings.sweeping_enabled ? totalBandwidth : bandwidth}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            disabled={settings.sweeping_enabled || lockBandwidthSampleRate}
            sx={{ flex: 1, ml: 2 }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={lockBandwidthSampleRate}
                onChange={handleChange}
                name="lockBandwidthSampleRate"
                color="primary"
              />
            }
            label="Lock Bandwidth to Sample Rate"
          />
          <FormControlLabel
            control={
              <Switch
                checked={dcSuppress}
                onChange={handleChange}
                name="dcSuppress"
                color="primary"
              />
            }
            label="Suppress DC Spike"
          />
        </Box>
      </Box>

      {/* Sweep Settings Box */}
      <Box
        sx={{
          backgroundColor: 'inherit', // Same background color as the rest of the panel
          padding: 3, // Padding for spacing
          borderRadius: 2, // Rounded edges
          border: '2px solid white', // White border for distinction
          mt: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Sweep Settings</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.sweeping_enabled}
              onChange={handleChange}
              name="sweeping_enabled"
              color="primary"
            />
          }
          label="Enable Sweep"
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Start Frequency (MHz)"
            name="frequency_start"
            type="number"
            value={settings.frequency_start}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            margin="dense"
            label="Stop Frequency (MHz)"
            name="frequency_stop"
            type="number"
            value={settings.frequency_stop}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            sx={{ flex: 1, ml: 2 }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Total Bandwidth (MHz)"
            name="total_bandwidth"
            type="number"
            value={totalBandwidth}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 0.1 }}
            sx={{ flex: 1, mr: 2 }}
            disabled
          />
          <TextField
            margin="dense"
            label="Sweep Steps"
            name="sweep_steps"
            type="number"
            value={settings.sweep_steps}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 1 }}
            sx={{ flex: 1, ml: 2 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SDRSettings;
