import React, { useEffect } from 'react';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

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
      <Box display="flex" justifyContent="space-between">
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
          style={{ flex: 1, marginRight: 8 }}
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
          style={{ flex: 1, marginLeft: 8 }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between">
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
          style={{ flex: 1, marginRight: 8 }}
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
          style={{ flex: 1, marginLeft: 8 }}
        />
      </Box>
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
      <FormControlLabel
        control={
          <Switch
            checked={showSecondTrace}
            onChange={handleSecondTraceToggle}
            name="showSecondTrace"
            color="primary"
          />
        }
        label="Show Second Trace Instead of First"
      />
    </Box>
  );
};

export default SDRSettings;
