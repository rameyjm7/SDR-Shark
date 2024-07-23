import React from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch, TextField } from '@mui/material';

const PlotSettings = ({ settings, handleSliderChange, handleSliderChangeCommitted, handleChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>
      <Typography gutterBottom>Averaging Count: {settings.averagingCount}</Typography>
      <Slider
        min={1}
        max={100}
        value={settings.averagingCount}
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
            checked={settings.dcSuppress}
            onChange={handleChange}
            name="dcSuppress"
            color="primary"
          />
        }
        label="Suppress DC Spike"
      />
      <Typography gutterBottom>Number of X-Axis Ticks: {settings.numTicks}</Typography>
      <Slider
        min={2}
        max={20}
        value={settings.numTicks}
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
  );
};

export default PlotSettings;
