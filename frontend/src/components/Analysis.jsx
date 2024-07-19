import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, FormControlLabel, Slider, Switch, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Analysis = ({ settings, setSettings }) => {
  const [peaks, setPeaks] = useState([]);

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    const value = type === 'checkbox' ? checked : parseFloat(e.target.value);
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSliderChange = (e, value, name) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const columns = [
    { field: 'peak', headerName: 'Peak', width: 100 },
    { field: 'frequency', headerName: 'Frequency (MHz)', width: 180 },
    { field: 'power', headerName: 'Power (dB)', width: 140 },
    { field: 'classification', headerName: 'Classification', width: 150 },
  ];

  useEffect(() => {
    const fetchPeaks = async () => {
      try {
        const response = await axios.get('http://10.139.1.185:5000/api/data');
        const data = response.data;
        setPeaks(data.peaks);
      } catch (error) {
        console.error('Error fetching peaks:', error);
      }
    };

    const interval = setInterval(fetchPeaks, 250); // Fetch peaks data every 250ms
    return () => clearInterval(interval);
  }, [settings]);

  const rows = peaks.map((peak, index) => {
    const freq = peak.toFixed(2); // Peaks are already in MHz
    const indexValue = Math.round((peak * 1e6 - settings.frequency * 1e6 + settings.sampleRate / 2) / settings.sampleRate * settings.peaks.length);
    const power = settings.peaks[indexValue]?.toFixed(2);
    return {
      id: index,
      peak: `Peak ${index + 1}`,
      frequency: freq, // Convert to MHz
      power: power,
      classification: '???',
    };
  });

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={settings.peakDetection}
            onChange={handleChange}
            name="peakDetection"
            color="primary"
          />
        }
        label="Enable Peak Detection"
      />
      {settings.peakDetection && (
        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Peak Detection</Typography>
          <Typography gutterBottom>Min Distance Between Peaks (MHz): {settings.minPeakDistance}</Typography>
          <Slider
            min={0.01}
            max={1.0}
            value={settings.minPeakDistance}
            onChange={(e, value) => handleSliderChange(e, value, 'minPeakDistance')}
            valueLabelDisplay="auto"
            step={0.01}
            marks={[
              { value: 0.01, label: '0.01 MHz' },
              { value: 0.5, label: '0.5 MHz' },
              { value: 1.0, label: '1 MHz' }
            ]}
          />
          <Typography gutterBottom>Number of Peaks: {settings.numberOfPeaks}</Typography>
          <Slider
            min={1}
            max={20}
            value={settings.numberOfPeaks}
            onChange={(e, value) => handleSliderChange(e, value, 'numberOfPeaks')}
            valueLabelDisplay="auto"
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 10, label: '10' },
              { value: 20, label: '20' }
            ]}
          />
        </Box>
      )}
    </Box>
  );
};

export default Analysis;
