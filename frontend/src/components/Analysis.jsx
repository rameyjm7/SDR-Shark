import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, FormControlLabel, Slider, Switch, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Analysis = ({ settings, setSettings }) => {
  const [peaks, setPeaks] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newSettings = {
      ...settings,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.post('/api/update_settings', newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const columns = [
    { field: 'frequency', headerName: 'Frequency (MHz)', width: 180 },
    { field: 'power', headerName: 'Power (dB)', width: 140 },
    { field: 'classification', headerName: 'Classification', width: 150 },
    { field: 'bandwidth', headerName: 'Bandwidth (kHz)', width: 180 },
  ];

  const rows = peaks.map((peak, index) => ({
    id: index,
    frequency: peak.frequency,
    power: peak.power,
    classification: peak.classification,
    bandwidth: peak.bandwidth,
  }));

  useEffect(() => {
    const fetchPeaks = async () => {
      try {
        const response = await axios.get('/api/analytics');
        const data = response.data;
        setPeaks(data.peaks);
      } catch (error) {
        console.error('Error fetching peaks:', error);
      }
    };

    const interval = setInterval(fetchPeaks, 250); // Fetch peaks data every 250ms
    return () => clearInterval(interval);
  }, [setSettings]);

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
