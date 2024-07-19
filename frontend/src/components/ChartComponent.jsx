import React from 'react';
import Plot from 'react-plotly.js';

const ChartComponent = ({ data = [], settings, minY, maxY, peaks = [] }) => {
  const generateColor = (value, min, max) => {
    const percentage = (value - min) / (max - min);
    const red = Math.min(255, Math.floor(255 * percentage));
    const green = Math.min(255, Math.floor(255 * (1 - percentage)));
    return `rgb(${red},${green},0)`;
  };

  const generateAnnotations = (peaks, fftData) => {
    const minPower = Math.min(...fftData);
    const maxPower = Math.max(...fftData);

    return peaks.map((peak) => {
      const freq = ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2);
      const power = fftData[peak]?.toFixed(2);
      const powerColor = generateColor(power, minPower, maxPower);
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
