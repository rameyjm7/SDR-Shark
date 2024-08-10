import React, { useEffect } from 'react';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';

const SDRSettings = ({ settings, handleChange, handleKeyPress }) => {
  const totalBandwidth = settings.frequency_stop - settings.frequency_start;
  const centerFrequency = (settings.frequency_start + settings.frequency_stop) / 2;

  // Effect to handle bandwidth update when sample rate changes
  useEffect(() => {
    if (settings.lockBandwidthSampleRate && settings.bandwidth !== settings.sampleRate) {
      handleChange({
        target: {
          name: 'bandwidth',
          value: settings.sampleRate,
        },
      });
    }
  }, [settings.sampleRate, settings.lockBandwidthSampleRate, handleChange]);

  const sdrDefaults = {
    hackrf: {
      frequency: 700,
      gain: 40,
      sampleRate: 20,
      bandwidth: 20,
    },
    sidekiq: {
      frequency: 2400,
      gain: 60,
      sampleRate: 60,
      bandwidth: 60,
    },
  };

  const handleSdrChange = (e) => {
    const newSdr = e.target.value;
    const defaults = sdrDefaults[newSdr];

    handleChange({
      target: {
        name: 'sdr',
        value: newSdr,
      },
    });

    handleChange({
      target: {
        name: 'frequency',
        value: defaults.frequency,
      },
    });

    handleChange({
      target: {
        name: 'gain',
        value: defaults.gain,
      },
    });

    handleChange({
      target: {
        name: 'sampleRate',
        value: defaults.sampleRate,
      },
    });

    handleChange({
      target: {
        name: 'bandwidth',
        value: defaults.bandwidth,
      },
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <TextField
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
          style={{ flex: 1, marginRight: 8 }}
        />
        <TextField
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
          style={{ flex: 1, marginLeft: 8 }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between">
        <TextField
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
          style={{ flex: 1, marginRight: 8 }}
        />
        <TextField
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
          disabled={settings.sweeping_enabled || settings.lockBandwidthSampleRate}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={settings.lockBandwidthSampleRate}
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
