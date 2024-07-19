import React from 'react';
import { Box, Button, FormControlLabel, Paper, Slider, Switch, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const ControlPanel = ({ settings, setSettings, updateSettings, minY, setMinY, maxY, setMaxY, updateInterval, setUpdateInterval, waterfallSamples, setWaterfallSamples, fftData, peaks }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(settings);
  };

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
        <TextField
          fullWidth
          margin="dense"
          label="Averaging Count"
          name="averagingCount"
          type="number"
          value={settings.averagingCount}
          onChange={handleChange}
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

        <Typography variant="h6" sx={{ mt: 2 }}>Waterfall Settings</Typography>
        <Typography gutterBottom>Update Interval (ms): {updateInterval}</Typography>
        <Slider
          min={10}
          max={1000}
          value={updateInterval}
          onChange={handleUpdateIntervalChange}
          valueLabelDisplay="auto"
        />
        <Typography gutterBottom>Waterfall Samples: {waterfallSamples}</Typography>
        <Slider
          min={1}
          max={100}
          value={waterfallSamples}
          onChange={handleWaterfallSamplesChange}
          valueLabelDisplay="auto"
        />

        <Typography gutterBottom>Min Y: {minY}</Typography>
        <Slider
          min={-60}
          max={20}
          value={minY}
          onChange={(e, value) => setMinY(value)}
          valueLabelDisplay="auto"
        />
        <Typography gutterBottom>Max Y: {maxY}</Typography>
        <Slider
          min={20}
          max={60}
          value={maxY}
          onChange={(e, value) => setMaxY(value)}
          valueLabelDisplay="auto"
        />
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Settings
        </Button>
      </Box>
      {settings.peakDetection && peaks.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Peak</TableCell>
                <TableCell>Frequency (MHz)</TableCell>
                <TableCell>Amplitude (dB)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {peaks.map((peak, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2)}</TableCell>
                  <TableCell>{fftData[peak]?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default ControlPanel;
