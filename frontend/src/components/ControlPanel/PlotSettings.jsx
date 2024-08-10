import React from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch } from '@mui/material';

const PlotSettings = ({
  settings,
  setSettings,
  handleSliderChange,
  handleSliderChangeCommitted,
  handleChange,
  minY,
  maxY,
  setMinY,
  setMaxY,
}) => {
  // Add default values to avoid undefined state
  const averagingCount = settings.averagingCount || 10;
  const numTicks = settings.numTicks || 5;
  const dcSuppress = settings.dcSuppress || false;
  const showSecondTrace = settings.showSecondTrace !== undefined ? settings.showSecondTrace : true;

  const handleSecondTraceToggle = (e) => {
    setSettings({ ...settings, showSecondTrace: e.target.checked });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>

      <Typography gutterBottom>Averaging Count: {averagingCount}</Typography>
      <Slider
        min={1}
        max={100}
        value={averagingCount}
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
            checked={dcSuppress}
            onChange={handleChange}
            name="dcSuppress"
            color="primary"
          />
        }
        label="Suppress DC Spike"
      />

      <Typography gutterBottom>Number of X-Axis Ticks: {numTicks}</Typography>
      <Slider
        min={2}
        max={20}
        value={numTicks}
        onChange={(e, value) => handleSliderChange(e, value, 'numTicks')}
        onChangeCommitted={(e, value) => handleSliderChangeCommitted(e, value, 'numTicks')}
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: 2, label: '2' },
          { value: 10, label: '10' },
          { value: 20, label: '20' },
        ]}
      />

      <Typography gutterBottom>Min Y-Axis Range: {minY} dB</Typography>
      <Slider
        min={-120}
        max={0}
        value={minY}
        onChange={(e, value) => {
          setMinY(value);
        }}
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: -120, label: '-120 dB' },
          { value: 0, label: '0 dB' },
        ]}
      />

      <Typography gutterBottom>Max Y-Axis Range: {maxY} dB</Typography>
      <Slider
        min={-20}
        max={20}
        value={maxY}
        onChange={(e, value) => {
          setMaxY(value);
        }}
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: -20, label: '-20 dB' },
          { value: 20, label: '20 dB' },
        ]}
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
        label="Show Second Trace"
      />
    </Box>
  );
};

export default PlotSettings;
