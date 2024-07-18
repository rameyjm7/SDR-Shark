import React from 'react';
import {
  Box,
  TextField,
  Button,
  Slider,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const ControlPanel = ({
  settings,
  minY,
  maxY,
  peaks,
  data,
  handleChange,
  handleSliderChange,
  handleSubmit
}) => {


  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          fullWidth
          margin="dense"
          label="Frequency (MHz)"
          name="frequency"
          type="number"
          value={settings.frequency}
          onChange={handleChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1 }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Gain (dB)"
          name="gain"
          type="number"
          value={settings.gain}
          onChange={handleChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 1 }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Sample Rate (MHz)"
          name="sampleRate"
          type="number"
          value={settings.sampleRate}
          onChange={handleChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1 }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Bandwidth (MHz)"
          name="bandwidth"
          type="number"
          value={settings.bandwidth}
          onChange={handleChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 0.1 }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Averaging Count"
          name="averagingCount"
          type="number"
          value={settings.averagingCount}
          onChange={handleChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 1 }}
        />
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
          <TextField
            fullWidth
            margin="dense"
            label="Number of Peaks"
            name="numberOfPeaks"
            type="number"
            value={settings.numberOfPeaks}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 1 }}
          />
        )}
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Settings
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Min Y: {minY}</Typography>
        <Slider
          min={-60}
          max={20}
          value={minY}
          onChange={(e, value) => handleSliderChange('minY')(e, value)}
          valueLabelDisplay="auto"
        />
        <Typography gutterBottom>Max Y: {maxY}</Typography>
        <Slider
          min={20}
          max={60}
          value={maxY}
          onChange={(e, value) => handleSliderChange('maxY')(e, value)}
          valueLabelDisplay="auto"
        />
      </Box>
      {settings.peakDetection && peaks.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Peak</TableCell>
                <TableCell>Frequency (MHz)</TableCell>
                <TableCell>Amplitude (dB)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {peaks.map((peak, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / data.length)).toFixed(2)}</TableCell>
                  <TableCell>{data[peak] !== undefined ? data[peak].toFixed(2) : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default ControlPanel;
