import React from 'react';
import Plot from 'react-plotly.js';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const Analyzer = ({ fftData, metadata }) => {
  const createXAxis = () => {
    if (metadata && metadata.center_freq && metadata.sample_rate) {
      const centerFreqMHz = metadata.center_freq / 1e6;
      const sampleRateMHz = metadata.sample_rate / 1e6;
      const startFreq = centerFreqMHz - sampleRateMHz / 2;
      const endFreq = centerFreqMHz + sampleRateMHz / 2;
      const step = sampleRateMHz / fftData.length;
      return Array.from({ length: fftData.length }, (_, i) => startFreq + i * step);
    }
    return [];
  };

  const xAxis = createXAxis();

  return (
    <div>
      <Typography variant="h6">FFT Analysis</Typography>
      {fftData && fftData.length > 0 ? (
        <Plot
          data={[
            {
              x: xAxis,
              y: fftData,
              type: 'scatter',
              mode: 'lines',
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            title: 'FFT Plot',
            xaxis: {
              title: 'Frequency (MHz)',
            },
            yaxis: {
              title: 'Amplitude',
            },
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            font: {
              color: 'white',
            },
          }}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Typography variant="h6">No FFT Data Available</Typography>
      )}
      {metadata && (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Frequency (MHz)</TableCell>
                <TableCell>Bandwidth (MHz)</TableCell>
                <TableCell>Sample Rate (MHz)</TableCell>
                <TableCell>Gain</TableCell>
                <TableCell>Averaging</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{metadata.center_freq ? metadata.center_freq / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.bandwidth ? metadata.bandwidth / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.sample_rate ? metadata.sample_rate / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.gain !== undefined ? metadata.gain : 'N/A'}</TableCell>
                <TableCell>{metadata.averaging !== undefined ? metadata.averaging : 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Analyzer;
