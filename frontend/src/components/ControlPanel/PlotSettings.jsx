import React from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch } from '@mui/material';

const PlotSettings = ({ localSettings, handleSliderChange, handleSliderChangeCommitted, handleChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Plot Settings</Typography>
      <Typography gutterBottom>Averaging Count: {localSettings.averagingCount}</Typography>
      <Slider
        min={1}
        max={100}
        value={localSettings.averagingCount}
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
            checked={localSettings.dcSuppress}
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

export default PlotSettings;
