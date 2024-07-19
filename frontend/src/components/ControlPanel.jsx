import React from 'react';
import { Box, Button, Paper, Slider, TextField, Typography, Grid, FormControlLabel, Switch } from '@mui/material';

const ControlPanel = ({ settings, setSettings, updateSettings, minY, setMinY, maxY, setMaxY, updateInterval, setUpdateInterval, waterfallSamples, setWaterfallSamples }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSliderChange = (name) => (e, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleUpdateIntervalChange = (e, value) => {
    setUpdateInterval(value);
  };

  const handleWaterfallSamplesChange = (e, value) => {
    setWaterfallSamples(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      updateSettings(settings);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(settings);
  };

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <Typography variant="h6">SDR Settings</Typography>
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
          <Grid item xs={6}>
            <TextField
              fullWidth
              margin="dense"
              label="Sample Rate (MHz)"
              name="sampleRate"
              type="number"
              value={settings.sampleRate}
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
              label="Bandwidth (MHz)"
              name="bandwidth"
              type="number"
              value={settings.bandwidth}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 0.1 }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>
        <TextField
          fullWidth
          margin="dense"
          label="Averaging Count"
          name="averagingCount"
          type="number"
          value={settings.averagingCount}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 1 }}
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
          label="Block DC Spike"
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography gutterBottom>Min Y: {minY}</Typography>
            <Slider
              min={-60}
              max={20}
              value={minY}
              onChange={(e, value) => setMinY(value)}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>Max Y: {maxY}</Typography>
            <Slider
              min={20}
              max={60}
              value={maxY}
              onChange={(e, value) => setMaxY(value)}
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 2 }}>Waterfall Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography gutterBottom>Update Interval (ms): {updateInterval}</Typography>
            <Slider
              min={10}
              max={1000}
              value={updateInterval}
              onChange={handleUpdateIntervalChange}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>Waterfall Samples: {waterfallSamples}</Typography>
            <Slider
              min={25}
              max={1000}
              value={waterfallSamples}
              onChange={handleWaterfallSamplesChange}
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>

        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Settings
        </Button>
      </Box>
    </Paper>
  );
};

export default ControlPanel;
