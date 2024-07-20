import React, { useState } from 'react';
import { Container, Typography, CssBaseline, Tabs, Tab, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ControlPanel from './components/ControlPanel';
import Plots from './components/Plots';
import Analysis from './components/Analysis';
import Actions from './components/Actions';
import FileBrowser from './components/sdr_scheduler/FileBrowser';
import Analyzer from './components/sdr_scheduler/Analyzer';
import axios from 'axios';

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
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const App = () => {
  const [settings, setSettings] = useState({
    frequency: 100.1,
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAnalyze = (file) => {
    const relativePath = currentPath + file.name;
    console.log(`Analyzing file: ${relativePath}`);
    axios.get(`/file_manager/files/metadata?path=${encodeURIComponent(relativePath)}`)
      .then(response => {
        setMetadata(response.data.metadata);
        setFftData(response.data.fft_data);
        setTabValue(5);  // Switch to Data Analyzer tab
      })
      .catch(error => {
        console.error('Error analyzing file:', error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Typography variant="h4" gutterBottom>SDR Plot Application</Typography>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Control Panel" />
          <Tab label="Plots" />
          <Tab label="Analysis" />
          <Tab label="Actions" />
          <Tab label="File Manager" />
          <Tab label="Data Analyzer" />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <ControlPanel
            settings={settings}
            setSettings={setSettings}
            minY={minY}
            setMinY={setMinY}
            maxY={maxY}
            setMaxY={setMaxY}
            updateInterval={updateInterval}
            setUpdateInterval={setUpdateInterval}
            waterfallSamples={waterfallSamples}
            setWaterfallSamples={setWaterfallSamples}
            showWaterfall={showWaterfall}
            setShowWaterfall={setShowWaterfall}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Plots
            settings={settings}
            minY={minY}
            maxY={maxY}
            updateInterval={updateInterval}
            waterfallSamples={waterfallSamples}
            showWaterfall={showWaterfall}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Analysis settings={settings} setSettings={setSettings} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Actions tasks={tasks} setTasks={setTasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <FileBrowser onAnalyze={handleAnalyze} />
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <Analyzer fftData={fftData} metadata={metadata} />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
};

export default App;
