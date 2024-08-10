import React from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch } from '@mui/material';

const PlotSettings = ({ settings, handleSliderChange, handleSliderChangeCommitted, handleChange, minY, maxY, setMinY, setMaxY }) => {
  
  const handleMinYChange = (e, value) => {
    console.log(`Min Y-Axis changed to: ${value} dB`);
    setMinY(value);
  };

  const handleMaxYChange = (e, value) => {
    console.log(`Max Y-Axis changed to: ${value} dB`);
    setMaxY(value);
  };

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
      <Typography gutterBottom>Min Y-Axis Range: {minY} dB</Typography>
      <Slider
        min={-80}
        max={0}
        value={minY}
        onChange={handleMinYChange}  // Link to the new handler
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: -80, label: '-80 dB' },
          { value: 0, label: '0 dB' },
        ]}
      />
      <Typography gutterBottom>Max Y-Axis Range: {maxY} dB</Typography>
      <Slider
        min={0}
        max={60}
        value={maxY}
        onChange={handleMaxYChange}  // Link to the new handler
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: 0, label: '0 dB' },
          { value: 60, label: '60 dB' },
        ]}
      />
    </Box>
  );
};

export default PlotSettings;
