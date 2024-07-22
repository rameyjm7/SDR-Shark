import React from 'react';
import { Box, Typography, Slider, FormControlLabel, Switch } from '@mui/material';

const WaterfallSettings = ({ updateInterval, setUpdateInterval, waterfallSamples, setWaterfallSamples, showWaterfall, setShowWaterfall }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Waterfall Settings</Typography>
      <Typography gutterBottom>Update Interval (ms): {updateInterval}</Typography>
      <Slider
        min={10}
        max={1000}
        value={updateInterval}
        onChange={(e, value) => setUpdateInterval(value)}
        valueLabelDisplay="auto"
        step={10}
        marks={[
          { value: 10, label: '10 ms' },
          { value: 500, label: '500 ms' },
          { value: 1000, label: '1000 ms' },
        ]}
      />
      <Typography gutterBottom>Waterfall Samples: {waterfallSamples}</Typography>
      <Slider
        min={25}
        max={1000}
        value={waterfallSamples}
        onChange={(e, value) => setWaterfallSamples(value)}
        valueLabelDisplay="auto"
        step={25}
        marks={[
          { value: 25, label: '25' },
          { value: 500, label: '500' },
          { value: 1000, label: '1000' },
        ]}
      />
      <FormControlLabel
        control={
          <Switch
            checked={showWaterfall}
            onChange={() => {
              setShowWaterfall(!showWaterfall);
              const newSettings = { showWaterfall: !showWaterfall };
              setShowWaterfall(newSettings);
            }}
            name="showWaterfall"
            color="primary"
          />
        }
        label="Enable Waterfall"
      />
    </Box>
  );
};

export default WaterfallSettings;
