import React from 'react';
import Plot from 'react-plotly.js';

const ChartComponent = ({ data = [], settings, minY, maxY, peaks = [] }) => {
  const generateColor = (value) => {
    if (value >= 0) {
      // Green for hot signals
      return 'rgb(0, 255, 0)';
    } else if (value >= -10) {
      // Gradient from green to yellow for middle signals
      const ratio = (value + 10) / 10;
      const red = Math.floor(255 * (1 - ratio));
      const green = 255;
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else if (value >= -20) {
      // Gradient from yellow to red for cooler signals
      const ratio = (value + 20) / 10;
      const red = 255;
      const green = Math.floor(255 * ratio);
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Red for cool signals
      return 'rgb(255, 0, 0)';
    }
  };

  const generateAnnotations = (peaks, fftData) => {
    return peaks.map((peak) => {
      const freq = ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2);
      const power = fftData[peak]?.toFixed(2);
      const powerColor = generateColor(power);
      return {
        x: parseFloat(freq),
        y: parseFloat(power),
        xref: 'x',
        yref: 'y',
        text: `${freq} MHz<br><span style="color:${powerColor}">${power} dB</span>`,
        showarrow: true,
        arrowhead: 2,
        ax: 0,
        ay: -40,
        font: {
          size: 12,
          color: 'white',
        },
        align: 'center',
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
