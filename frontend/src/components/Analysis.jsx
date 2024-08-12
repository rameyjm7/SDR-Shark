import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, FormControlLabel, Slider, Switch, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Analysis = ({ settings, setSettings }) => {
  const [peaks, setPeaks] = useState([]);
  const [generalClassifications, setGeneralClassifications] = useState([]);

  const convertToHz = (valueInMHz) => valueInMHz * 1e6;
  const convertToMHz = (valueInHz) => valueInHz / 1e6;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : parseFloat(value);

    // Convert MHz to Hz for frequency, sampleRate, and bandwidth
    if (name === 'frequency' || name === 'sampleRate' || name === 'bandwidth') {
      newValue = convertToHz(newValue);
    }

    const newSettings = {
      ...settings,
      [name]: newValue,
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    let newValue = value;

    // Convert MHz to Hz for frequency, sampleRate, and bandwidth
    if (name === 'frequency' || name === 'sampleRate' || name === 'bandwidth') {
      newValue = convertToHz(newValue);
    }

    const newSettings = { ...settings, [name]: newValue };
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

  const peakColumns = [
    { field: 'frequency', headerName: 'Frequency (MHz)', width: 180 },
    { field: 'power', headerName: 'Power (dB)', width: 140 },
    { field: 'bandwidth', headerName: 'Bandwidth (MHz)', width: 140 },
    { field: 'classification', headerName: 'Classifications', width: 200 },
  ];

  const classificationColumns = [
    { field: 'label', headerName: 'Label', width: 180 },
    { field: 'frequency', headerName: 'Frequency (MHz)', width: 180 },
    { field: 'bandwidth', headerName: 'Bandwidth (MHz)', width: 140 },
    { field: 'channel', headerName: 'Channel', width: 200 },
  ];

  const peakRows = peaks.map((peak, index) => ({
    id: index,
    frequency: peak.frequency !== undefined ? convertToMHz(peak.frequency).toFixed(3) : 'N/A',
    power: peak.power !== undefined ? peak.power.toFixed(3) : 'N/A',
    bandwidth: peak.bandwidth !== undefined ? peak.bandwidth.toFixed(3) : 'N/A',
    classification: peak.classification?.map(c => `${c.label} (${c.channel})`).join(', ') || 'N/A', // Combine classifications
  }));

  const classificationRows = generalClassifications.map((classification, index) => ({
    id: index,
    label: classification.label,
    frequency: classification.frequency !== undefined ? convertToMHz(classification.frequency).toFixed(3) : 'N/A',
    bandwidth: classification.bandwidth !== undefined ? classification.bandwidth.toFixed(3) : 'N/A',
    channel: classification.channel,
  }));

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/analytics');
        const data = response.data;
        setPeaks(data.peaks);
        setGeneralClassifications(data.classifications); // Set general classifications
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    const interval = setInterval(fetchAnalytics, 250); // Fetch analytics data every 250ms
    return () => clearInterval(interval);
  }, [setSettings]);

  // Ensure peak detection is enabled by default
  useEffect(() => {
    if (settings.peakDetection === undefined) {
      const newSettings = { ...settings, peakDetection: true };
      setSettings(newSettings);
      updateSettings(newSettings);
    }
  }, [settings, setSettings]);

  return (
    <Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <FormControlLabel
          control={
            <Switch
              checked={settings.peakDetection} // Enable by default if undefined
              onChange={handleChange}
              name="peakDetection"
              color="primary"
            />
          }
          label="Annotate Peaks"
        />
        <>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box flex={1} mx={1}>
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
            <Box flex={1} mx={1}>
              <Typography gutterBottom>Peak Threshold (dB): {settings.peakThreshold}</Typography>
              <Slider
                min={-100}
                max={0}
                value={settings.peakThreshold}
                onChange={(e, value) => handleSliderChange(e, value, 'peakThreshold')}
                valueLabelDisplay="auto"
                step={1}
                marks={[
                  { value: -100, label: '-100 dB' },
                  { value: -50, label: '-50 dB' },
                  { value: 0, label: '0 dB' }
                ]}
              />
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box flex={1} mx={1}>
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
            </Box>
          </Box>
        </>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>General Classifications</Typography>
        <Box sx={{ height: 300, width: '100%', mt: 2 }}>
          <DataGrid
            rows={classificationRows}
            columns={classificationColumns}
            pageSize={5}
          />
        </Box>
      </Box>
      <Box sx={{ height: 400, width: '100%', mt: 2 }}>
        <Typography variant="h6" gutterBottom>Detected Peaks</Typography>
        <DataGrid
          rows={peakRows}
          columns={peakColumns}
          pageSize={5}
        />
      </Box>
    </Box>
  );
};

export default Analysis;
