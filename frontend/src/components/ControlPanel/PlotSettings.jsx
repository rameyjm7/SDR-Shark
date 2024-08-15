import React, { useState } from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch, Checkbox } from '@mui/material';

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
  const averagingCount = settings.averagingCount || 10;
  const numTicks = settings.numTicks || 5;
  const dcSuppress = settings.dcSuppress || false;

  const [lockYAxisRange, setLockYAxisRange] = useState(true); // Locked by default

  const handleMinYChange = (e, value) => {
    setMinY(value);
    if (lockYAxisRange) {
      setMaxY(value + 60); // Ensure the difference stays the same
    }
  };

  const handleMaxYChange = (e, value) => {
    setMaxY(value);
    if (lockYAxisRange) {
      setMinY(value - 60); // Ensure the difference stays the same
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, mr: 2 }}>
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
        </Box>

        <Box sx={{ flex: 1, mr: 2 }}>
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
        </Box>

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

      {/* Y Axis Limits Sub-Panel */}
      <Box
        sx={{
          backgroundColor: 'inherit', // Same background color as the rest of the panel
          padding: 3, // Padding for spacing
          borderRadius: 2, // Rounded edges
          border: '2px solid white', // White border for distinction
          mt: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Y Axis Limits</Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={lockYAxisRange}
              onChange={() => setLockYAxisRange(!lockYAxisRange)}
              color="primary"
            />
          }
          label="Lock Y-Axis Ranges"
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
          <Typography gutterBottom>Min Y-Axis Range: {minY.toFixed(2)} dB</Typography>
            <Slider
              min={-60}
              max={0}
              value={minY}
              onChange={handleMinYChange}
              valueLabelDisplay="auto"
              step={1}
              marks={[
                { value: -60, label: '-60 dB' },
                { value: 0, label: '0 dB' },
              ]}
            />
          </Box>
          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography gutterBottom>Max Y-Axis Range: {maxY.toFixed(2)} dB</Typography>
            <Slider
              min={-60}
              max={60}
              value={maxY}
              onChange={handleMaxYChange}
              valueLabelDisplay="auto"
              step={1}
              marks={[
                { value: -60, label: '-60 dB' },
                { value: 60, label: '60 dB' },
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlotSettings;
