import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const FFTPlot = ({ fftData, settings, minY, maxY, peaks }) => {
  const [tickVals, setTickVals] = useState([]);
  const [tickText, setTickText] = useState([]);

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
    if (!settings.peakDetection) return [];
    return peaks.map((peak) => {
      const freq = ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2);
      const power = fftData[peak]?.toFixed(2);
      const powerColor = generateColor(power);
      return {
        x: parseFloat(freq / 1e6), // Convert to MHz
        y: parseFloat(power),
        xref: 'x',
        yref: 'y',
        text: `${(freq / 1e6).toFixed(2)} MHz<br><span style="color:${powerColor}">${power} dB</span>`,
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

  const generatePeakTableAnnotation = (peaks, fftData) => {
    if (!settings.peakDetection || peaks.length === 0) return null;

    const rows = peaks.map((peak, index) => {
      const freq = ((settings.frequency - settings.sampleRate / 2) + (peak * settings.sampleRate / fftData.length)).toFixed(2);
      const power = fftData[peak]?.toFixed(2);
      return `Peak ${index + 1} | ${(freq / 1e6).toFixed(2)} MHz | ${power} dB<br>`;
    }).join('');

    const tableText = rows;

    return {
      x: 1,
      y: 1,
      xref: 'paper',
      yref: 'paper',
      text: tableText,
      showarrow: false,
      font: {
        size: 12,
        family: 'monospace',
        color: 'white',
      },
      align: 'left',
      bgcolor: 'rgba(0, 0, 0, 0.7)',
      bordercolor: 'white',
      borderwidth: 1,
      xanchor: 'right',
      yanchor: 'top',
      pad: {
        t: 10,
        r: 10,
        b: 10,
        l: 10,
      },
    };
  };

  const generateTickValsAndLabels = (centerFreq, bandwidth) => {
    const halfBandwidth = bandwidth / 2;
    const startFreq = centerFreq - halfBandwidth;
    const endFreq = centerFreq + halfBandwidth;
    const step = bandwidth / 4; // 5 ticks total, so 4 intervals

    const tickVals = [];
    const tickText = [];
    for (let i = 0; i <= 4; i++) {
      const freq = startFreq + i * step;
      tickVals.push(freq);
      tickText.push((freq / 1e6).toFixed(2)); // Convert to MHz
    }

    return { tickVals, tickText };
  };

  useEffect(() => {
    if (settings.sweeping_enabled) {
      const { tickVals, tickText } = generateTickValsAndLabels(
        (settings.frequency_start + settings.frequency_stop) / 2,
        settings.frequency_stop - settings.frequency_start + (settings.sdr === 'sidekiq' ? 60e6 : 20e6)
      );
      setTickVals(tickVals);
      setTickText(tickText);
    } else {
      const { tickVals, tickText } = generateTickValsAndLabels(
        settings.frequency,
        settings.bandwidth
      );
      setTickVals(tickVals);
      setTickText(tickText);
    }
  }, [settings.sweeping_enabled, settings.frequency_start, settings.frequency_stop, settings.sdr]);

  const peakAnnotations = generateAnnotations(peaks, fftData);
  const peakTableAnnotation = generatePeakTableAnnotation(peaks, fftData);

  return (
    <Plot
      data={[
        {
          x: Array.isArray(fftData) ? fftData.map((_, index) => ((settings.frequency - settings.sampleRate / 2) + (index * settings.sampleRate / fftData.length) / 1e6).toFixed(2)) : [], // Convert to MHz
          y: Array.isArray(fftData) ? fftData : [],
          type: 'scatter',
          mode: 'lines',
          fill: 'tozeroy',
          fillcolor: 'rgba(255, 255, 255, 0.3)', // Under trace color white with some transparency
          line: { color: 'white', shape: 'spline', width: 1 }, // White trace line
        },
      ]}
      layout={{
        title: '',
        xaxis: {
          title: 'Frequency (MHz)',
          color: 'white',
          gridcolor: '#444',
          tickvals: tickVals,
          ticktext: tickText,
          zeroline: false, // Remove the white line across the 0 mark
        },
        yaxis: {
          title: 'Amplitude (dB)',
          range: [minY, maxY],
          color: 'white',
          gridcolor: '#444',
          zeroline: false, // Remove the white line across the 0 mark
        },
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4,
        },
        paper_bgcolor: '#000',
        plot_bgcolor: '#000',
        font: {
          color: 'white',
        },
        annotations: [...peakAnnotations, peakTableAnnotation].filter(Boolean),
        showlegend: false, // Hide legend
      }}
      config={{
        displayModeBar: false, // Hide the mode bar
      }}
      style={{ width: '100%', height: '40vh' }}
    />
  );
};

export default FFTPlot;
