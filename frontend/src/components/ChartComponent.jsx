import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';

const ChartComponent = ({ data = [], settings, minY, maxY, peaks = [] }) => {
  const waterfallData = useRef([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const frameRef = useRef();

  const downsample = useCallback((data, factor) => {
    if (factor <= 1) return data;
    const downsampled = [];
    for (let i = 0; i < data.length; i += factor) {
      const chunk = data.slice(i, i + factor);
      const avg = chunk.reduce((acc, val) => acc + val, 0) / chunk.length;
      downsampled.push(avg);
    }
    return downsampled;
  }, []);

  const updateWaterfallData = useCallback(() => {
    const downsampledData = downsample(data, 4); // Adjust factor as needed
    if (downsampledData.length > 0) {
      if (waterfallData.current.length >= 100) {
        waterfallData.current.shift();
      }
      waterfallData.current.push([...downsampledData]);
      setHeatmapData([...waterfallData.current]);
    }
    frameRef.current = requestAnimationFrame(updateWaterfallData);
  }, [data, downsample]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(updateWaterfallData);
    return () => cancelAnimationFrame(frameRef.current);
  }, [updateWaterfallData]);

  const generateColor = (value) => {
    if (value >= 0) {
      return 'rgb(0, 255, 0)';
    } else if (value >= -10) {
      const ratio = (value + 10) / 10;
      const red = Math.floor(255 * (1 - ratio));
      const green = 255;
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else if (value >= -20) {
      const ratio = (value + 20) / 10;
      const red = 255;
      const green = Math.floor(255 * ratio);
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
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
    <div>
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
        style={{ width: '100%', height: '40vh' }}
      />
      <Plot
        data={[
          {
            z: heatmapData,
            type: 'heatmap',
            colorscale: 'Jet',
            zsmooth: 'fast',
          },
        ]}
        layout={{
          title: 'Waterfall Plot',
          xaxis: {
            title: 'Frequency (MHz)',
            color: 'white',
            gridcolor: '#444',
            tickvals: downsample(data, 4).map((_, index) => index),
            ticktext: downsample(data, 4).map((_, index) => ((settings.frequency - settings.sampleRate / 2) + (index * settings.sampleRate / data.length)).toFixed(2)),
          },
          yaxis: {
            title: 'Time',
            color: 'white',
            gridcolor: '#444',
          },
          paper_bgcolor: '#000',
          plot_bgcolor: '#000',
          font: {
            color: 'white',
          },
        }}
        style={{ width: '100%', height: '40vh' }}
      />
    </div>
  );
};

export default ChartComponent;
