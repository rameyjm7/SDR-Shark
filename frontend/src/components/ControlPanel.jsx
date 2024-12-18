import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, IconButton, Tabs, Tab, Button, CircularProgress, Slider, FormControlLabel, Switch } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import SDRSettings from './ControlPanel/SDRSettings';
import PlotSettings from './ControlPanel/PlotSettings';
import Analysis from './Analysis';
import Classifiers from './ControlPanel/Classifiers';
import debounce from 'lodash/debounce';
import '../App.css';
import Actions from './Actions';
const ControlPanel = ({
  settings,
  setSettings,
  minY,
  setMinY,
  maxY,
  setMaxY,
  updateInterval,
  setUpdateInterval,
  waterfallSamples,
  setWaterfallSamples,
  showWaterfall,
  setShowWaterfall,
  addVerticalLines,
  clearVerticalLines,
  addHorizontalLines,
  clearHorizontalLines,
  handleSaveSelection,
  verticalLines, // Add this prop to receive vertical lines
}) => {
  const [sdr, setSdr] = useState(settings.sdr || 'hackrf');
  const [status, setStatus] = useState('Ready');
  const [saving, setSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    if (!settingsLoaded) {
      fetchSettings();
    }
  }, [settingsLoaded]);



  // Function to delete a task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, taskIndex) => taskIndex !== index);
    setTasks(updatedTasks);

    // Adjust currentTaskIndex if necessary
    if (currentTaskIndex === index) {
      setCurrentTaskIndex(null); // Reset currentTaskIndex if deleted
    } else if (currentTaskIndex > index) {
      setCurrentTaskIndex((prev) => prev - 1); // Adjust if a prior task was deleted
    }
  };

  // Function to duplicate a task
  const duplicateTask = (index) => {
    const taskToDuplicate = tasks[index];
    const duplicatedTask = { ...taskToDuplicate }; // Create a shallow copy
    const updatedTasks = [...tasks];
    updatedTasks.splice(index + 1, 0, duplicatedTask); // Insert duplicated task
    setTasks(updatedTasks);
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/get_settings');
      const data = response.data;
      setSdr(data.sdr);

      setSettings((prevSettings) => ({
        ...prevSettings,
        showSecondTrace: data.sdr === 'hackrf',
        ...data,
      }));

      setSettings(data);
      setUpdateInterval(data.updateInterval);
      setMinY(minY);
      setMaxY(maxY);
      setStatus('Settings loaded');
      setSettingsLoaded(true);
      setTimeout(fetchAndAdjustYAxis, 1000);

    } catch (error) {
      console.error('Error fetching settings:', error);
      setStatus('Error fetching settings');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axios.post('/api/update_settings', newSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings(newSettings);
      setStatus('Settings updated');

      setTimeout(fetchAndAdjustYAxis, 1000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  };

  const fetchAndAdjustYAxis = async () => {
    try {
      const response = await axios.get('/api/noise_floor');
      const noiseFloor = response.data.noise_floor;

      const newMinY = noiseFloor - 30;
      const newMaxY = noiseFloor + 70;
      setMinY(newMinY);
      setMaxY(newMaxY);
    } catch (error) {
      console.error('Error fetching noise floor:', error);
    }
  };

  const handleSaveSelectionClick = async () => {
    setSaving(true);
    setStatus('Saving file...');

    try {
      await handleSaveSelection();
      setStatus('Selection saved successfully');
    } catch (error) {
      console.error('Error saving selection:', error);
      setStatus('Error saving selection');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : parseFloat(value);
    const newSettings = { ...settings, [name]: newValue };
    setSettings(newSettings);
  };

  const handleSliderChange = (e, value, name) => {
    const newSettings = { ...settings, [name]: value };
    setSettings(newSettings);
    // if (name === 'averagingCount') {
    //   debouncedApplySettings(newSettings);
    // }
  };

  const handleSliderChangeCommitted = (e, value, name) => {
    if (name === 'averagingCount') {
      applySettings({ ...settings, [name]: value });
    }
  };

  const debouncedApplySettings = debounce((newSettings) => {
    applySettings(newSettings);
  }, 300);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applySettings(settings);
    }
  };

  const handleSdrChange = (e) => {
    const newSdr = e.target.value;
    setSdr(newSdr);
    setStatus(`Changing SDR to ${newSdr}...`);

    const updatedSettings = {
      ...settings,
      sdr: newSdr,
      showSecondTrace: newSdr === 'hackrf',
    };
    setSettings(updatedSettings);

    axios.post('/api/select_sdr', { sdr_name: newSdr })
      .then(response => {
        console.log('SDR changed:', response.data);
        applySettings(updatedSettings);
        setStatus(`SDR changed to ${newSdr}`);
      })
      .catch(error => {
        console.error('Error changing SDR:', error);
        setStatus('Error changing SDR');
      });
  };

  const enforceLimits = (settings) => {
    const newSettings = { ...settings };
    const limitKeys = ['frequency', 'gain', 'sampleRate', 'bandwidth'];

    limitKeys.forEach((key) => {
      const limit = sdrLimits[sdr][key];
      if (newSettings[key] < limit.min) {
        newSettings[key] = limit.min;
      }
      if (newSettings[key] > limit.max) {
        newSettings[key] = limit.max;
      }
    });

    return newSettings;
  };

  const applySettings = async (newSettings) => {
    const enforcedSettings = enforceLimits(newSettings);
    setStatus('Updating settings...');

    const interval = settings.updateInterval;
    // Temporarily set updateInterval to 5000
    setUpdateInterval(5000);

    try {
      await axios.post('/api/update_settings', enforcedSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSettings(enforcedSettings);
      // After settings are applied, revert updateInterval to the original value
      setUpdateInterval(interval);

      setStatus('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      setStatus('Error updating settings');
    }
  };


  const sdrLimits = {
    hackrf: {
      frequency: { min: 0, max: 7250 },
      gain: { min: 0, max: 61 },
      sampleRate: { min: 0, max: 20 },
      bandwidth: { min: 0, max: 20 },
    },
    sidekiq: {
      frequency: { min: 46.875, max: 6000 },
      gain: { min: 0, max: 76 },
      sampleRate: { min: 0.233, max: 61.233 },
      bandwidth: { min: 0.233, max: 61.233 },
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box className="control-panel" sx={{ p: 2 }}>
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          {saving ? (
            <>
              Saving file... <CircularProgress size={14} sx={{ ml: 1 }} />
            </>
          ) : (
            `Status: ${status}`
          )}
        </Typography>
        <IconButton onClick={fetchSettings} sx={{ ml: 2 }}>
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={() => applySettings(settings)} sx={{ ml: 2 }}>
          <SaveIcon />
        </IconButton>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="SDR" />
        <Tab label="Plot" />
        <Tab label="Analysis" />
        <Tab label="Classifiers" />
        <Tab label="Actions" />
      </Tabs>
      <Box className="control-panel-tab-content">
        {tabIndex === 0 && (
          <>
            <Typography variant="h6">SDR Settings</Typography>
            <Typography variant="body1">Select SDR:</Typography>
            <Select value={sdr} onChange={handleSdrChange} fullWidth>
              <MenuItem value="hackrf">HackRF</MenuItem>
              <MenuItem value="sidekiq">Sidekiq</MenuItem>
            </Select>
            <SDRSettings
              settings={settings}
              handleChange={handleChange}
              handleKeyPress={handleKeyPress}
              setSettings={setSettings}
            />
          </>
        )}
        {tabIndex === 1 && (
          <>
            <PlotSettings
              settings={settings}
              setSettings={setSettings}
              setUpdateInterval={setUpdateInterval}
              handleSliderChange={handleSliderChange}
              handleSliderChangeCommitted={handleSliderChangeCommitted}
              handleChange={handleChange}
              minY={minY}
              setMinY={setMinY}
              maxY={maxY}
              setMaxY={setMaxY}
            />
            {/* <WaterfallSettings
              settings={settings}
              setSettings={setSettings}
              showWaterfall={showWaterfall}
              setShowWaterfall={setShowWaterfall}
            /> */}

            <Box>
              <Typography variant="h6" sx={{ mt: 2 }}>Waterfall Settings</Typography>

              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>

                <Box sx={{ flex: 1, ml: 2 }}>
                  <Typography gutterBottom>Waterfall Samples: {settings.waterfallSamples}</Typography>
                  <Slider
                    min={25}
                    max={1000}
                    value={settings.waterfallSamples}
                    onChange={(e, value) => setSettings({ ...settings, waterfallSamples: value })}
                    valueLabelDisplay="auto"
                    step={25}
                    marks={[
                      { value: 25, label: '25' },
                      { value: 500, label: '500' },
                      { value: 1000, label: '1000' },
                    ]}
                  />
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={showWaterfall}
                    onChange={() => {
                      setSettings(!showWaterfall);
                      const newSettings = { ...settings, showWaterfall: !showWaterfall };
                      setSettings(newSettings);
                    }}
                    name="showWaterfall"
                    color="primary"
                  />
                }
                label="Enable Waterfall"
              />
            </Box>

          </>
        )}
        {tabIndex === 2 && (
          <Analysis
            settings={settings}
            setSettings={setSettings}
            addVerticalLines={addVerticalLines} // Ensure vertical lines are added correctly
            clearVerticalLines={clearVerticalLines}
            addHorizontalLines={addHorizontalLines}
            clearHorizontalLines={clearHorizontalLines}
          />
        )}
        {tabIndex === 3 && (
          <Classifiers
            settings={settings}
            setSettings={setSettings}
            addVerticalLines={addVerticalLines} // Ensure vertical lines are added correctly
            clearVerticalLines={clearVerticalLines}
            addHorizontalLines={addHorizontalLines}
            clearHorizontalLines={clearHorizontalLines}
          />
        )}
        {tabIndex === 4 && (
          <Actions
            settings={settings}
            setSettings={setSettings}
            deleteTask={deleteTask}
            duplicateTask={duplicateTask}
            currentTaskIndex={currentTaskIndex}
            tasks={tasks}
            setTasks={(newTasks) => {
              console.log(newTasks);
              setTasks(newTasks);

              // Extract center frequency and bandwidth from the new tasks
              if (newTasks.length > 0) {
                const latestTask = newTasks[newTasks.length - 1];

                if (latestTask.frequency && latestTask.bandwidth) {
                  const newSettings = {
                    ...settings,
                    centerFrequency: latestTask.frequency,
                    bandwidth: latestTask.bandwidth,
                  };

                  // Update settings with the extracted values
                  setSettings(newSettings);

                  // Optionally log the update for debugging
                  console.log("Updated settings with task values:", newSettings);
                }
              }
            }}
          />
        )}



      </Box>
    </Box>
  );
};

export default ControlPanel;
