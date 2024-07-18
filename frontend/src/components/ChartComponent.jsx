import React from 'react';
import Plot from 'react-plotly.js';

const ChartComponent = ({ data = [], settings, minY, maxY, peaks = [] }) => {
  const generateAnnotations = (peaks, fftData) => {
    return peaks.map((peak) => {
      const freq = ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2);
      return {
        x: parseFloat(freq),
        y: fftData[peak],
        xref: 'x',
        yref: 'y',
        text: 'Peak',
        showarrow: true,
        arrowhead: 2,
        ax: 0,
        ay: -40,
      };
    });
  };

  const peakAnnotations = generateAnnotations(peaks, data);

  return (
    <Plot
      data={[
        {
          x: Array.isArray(data) ? data.map((_, index) => ((settings.frequency - settings.sampleRate / 2) + (index * settings.sampleRate / data.length)).toFixed(2)) : [],
          y: Array.isArray(data) ? data : [],
          type: 'scatter',
          mode: 'lines',
          marker: { color: 'orange' },
          line: { shape: 'spline' },
        },
      ]}
      layout={{
        title: 'Spectrum Viewer',
        xaxis: {
          title: 'Frequency (MHz)',
          color: 'white',
          gridcolor: '#444',
        },
        yaxis: {
          title: 'Amplitude (dB)',
          range: [minY, maxY],
          color: 'white',
          gridcolor: '#444',
        },
        paper_bgcolor: '#000',
        plot_bgcolor: '#000',
        font: {
          color: 'white',
        },
        annotations: peakAnnotations,
      }}
      style={{ width: '100%', height: '75vh' }}
    />
  );
};

export default ChartComponent;
