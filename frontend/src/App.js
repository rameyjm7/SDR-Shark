import React, { useState, useEffect } from 'react';
import { Typography, CssBaseline, Tabs, Tab, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Split from 'split.js';
import ControlPanel from './components/ControlPanel';
import Plots from './components/Plots';
import Analysis from './components/Analysis';
import Actions from './components/Actions';
import FileBrowser from './components/sdr_scheduler/FileBrowser';
import Analyzer from './components/sdr_scheduler/Analyzer';
import SigDex from './components/SigDex';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000',
      paper: '#121212',
    },
    text: {
      primary: '#fff',
    },
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: '100%' }} // Ensure the TabPanel takes up the full height
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const App = () => {
  const [settings, setSettings] = useState({
    frequency: 0,
    gain: 10,
    sampleRate: 1,
    bandwidth: 1,
    averagingCount: 10,
    dcSuppress: true,
    peakDetection: true,
    minPeakDistance: 0.1,
    numberOfPeaks: 5,
    showWaterfall: true,
  });
  const [showSecondTrace, setShowSecondTrace] = useState(false);
  const [minY, setMinY] = useState(-120);
  const [maxY, setMaxY] = useState(0);
  const [updateInterval, setUpdateInterval] = useState(500);
  const [waterfallSamples, setWaterfallSamples] = useState(100);
  const [showWaterfall, setShowWaterfall] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [metadata, setMetadata] = useState(null);
  const [fftData, setFftData] = useState([]);
  const [plotWidth, setPlotWidth] = useState(60); // Initial plot width in percentage

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAnalyze = (file) => {
    const relativePath = currentPath + file.name;
    console.log(`Analyzing file: ${relativePath}`);

    axios.get(`/api/file_manager/files/metadata`, {
      params: {
        path: file.name,
        current_dir: currentPath,
      }
    })
      .then(response => {
        setMetadata(response.data.metadata);
        setFftData(response.data.fft_data);
        setTabValue(4);  // Switch to Data Analyzer tab
      })
      .catch(error => {
        console.error('Error analyzing file:', error);
      });
  };

  useEffect(() => {
    const adjustPlotWidth = () => {
      const leftPanelWidth = document.getElementById('leftPanel').clientWidth;
      const totalWidth = document.getElementById('plotsContainer').clientWidth;
      const newPlotWidth = (leftPanelWidth / totalWidth) * 100;

      setPlotWidth(newPlotWidth);
    };

    const splitInstance = Split(['#leftPanel', '#rightPanel'], {
      sizes: [60, 40], // Adjust initial sizes for more flexibility
      minSize: 100,    // Allow more shrinking of panels
      gutterSize: 10,  // Size of the gutter (resize handle)
      cursor: 'col-resize',
      onDrag: adjustPlotWidth,
    });

    adjustPlotWidth(); // Adjust the width on initial load

    window.addEventListener('resize', adjustPlotWidth);

    return () => {
      splitInstance.destroy();
      window.removeEventListener('resize', adjustPlotWidth);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box id="plotsContainer" sx={{ padding: 0, margin: 0, width: '100%', height: '100%' }}>
        <Typography variant="h4" gutterBottom>SDR Plot Application</Typography>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Plots" />
          <Tab label="Analysis" />
          <Tab label="Actions" />
          <Tab label="File Manager" />
          <Tab label="Data Analyzer" />
          <Tab label="SigDex" />
        </Tabs>
        <Box sx={{ display: 'flex', height: 'calc(100% - 100px)' }}>
          <Box id="leftPanel" sx={{ paddingRight: '10px', borderRight: '2px solid #444', height: '100%', flex: '0 1 auto' }}>
            <TabPanel value={tabValue} index={0}>
              <Plots
                settings={settings}
                minY={minY}
                maxY={maxY}
                setMinY={setMinY}  // Ensure these are passed to Plots
                setMaxY={setMaxY}
                updateInterval={updateInterval}
                waterfallSamples={waterfallSamples}
                showWaterfall={showWaterfall}
                showSecondTrace={showSecondTrace}
                plotWidth={plotWidth} // Pass the calculated plot width as a prop
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Analysis settings={settings} setSettings={setSettings} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Actions tasks={tasks} setTasks={setTasks} />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <FileBrowser onAnalyze={handleAnalyze} />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <Analyzer fftData={fftData} metadata={metadata} />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              <Box sx={{ height: '100%', overflowY: 'auto' }}>  {/* Ensure SigDex is contained within the tab */}
                <SigDex />
              </Box>
            </TabPanel>
          </Box>
          <Box id="rightPanel" sx={{ paddingLeft: '10px', height: '100%', flex: '0 1 auto' }}>
          <ControlPanel
            settings={settings}
            setSettings={setSettings}
            minY={minY}
            setMinY={(value) => { setMinY(value); }}
            maxY={maxY}
            setMaxY={(value) => { setMaxY(value); }}
            updateInterval={updateInterval}
            setUpdateInterval={setUpdateInterval}
            waterfallSamples={waterfallSamples}
            setWaterfallSamples={setWaterfallSamples}
            showWaterfall={showWaterfall}
            setShowWaterfall={setShowWaterfall}
          />
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
};

export default App;
