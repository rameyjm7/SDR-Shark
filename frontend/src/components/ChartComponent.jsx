import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const ChartComponent = ({ settings, minY, maxY, updateInterval, waterfallSamples, showWaterfall }) => {
  const [fftData, setFftData] = useState([]);
  const [waterfallData, setWaterfallData] = useState([]);
  const [time, setTime] = useState('');
  const [peaks, setPeaks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.139.1.185:5000/api/data');
        const data = response.data;
        console.log('Fetched data from /api/data:', data);
        setFftData(data.fft);
        setWaterfallData(data.waterfall.slice(-waterfallSamples));
        setTime(data.time);
        console.log('Updated fftData:', data.fft);
        console.log('Updated waterfallData:', data.waterfall.slice(-waterfallSamples));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(fetchData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval, waterfallSamples]);

  useEffect(() => {
    const fetchPeaks = async () => {
      try {
        const response = await axios.get('http://10.139.1.185:5000/api/analytics');
        console.log('Fetched data from /api/analytics:', response.data);
        setPeaks(response.data.peaks);
      } catch (error) {
        console.error('Error fetching peaks:', error);
      }
    };

    const interval = setInterval(fetchPeaks, 250);
    return () => clearInterval(interval);
  }, []);

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

  const generateAnnotations = (peaks) => {
    if (!settings.peakDetection || !Array.isArray(peaks)) return [];
    console.log('Generating annotations for peaks:', peaks);
    return peaks.map((peak) => {
      const freq = peak.frequency.toFixed(2);
      const power = peak.power.toFixed(2);
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

  const generatePeakTableAnnotation = (peaks) => {
    if (!settings.peakDetection || !Array.isArray(peaks) || peaks.length === 0) return null;
    console.log('Generating peak table annotation for peaks:', peaks);
    const rows = peaks.map((peak, index) => {
      const freq = peak.frequency.toFixed(2);
      const power = peak.power.toFixed(2);
      return `Peak ${index + 1} | ${freq} MHz | ${power} dB<br>`;
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

  const peakAnnotations = generateAnnotations(peaks);
  const peakTableAnnotation = generatePeakTableAnnotation(peaks);

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

  const { tickVals, tickText } = generateTickValsAndLabels(settings.frequency * 1e6, settings.bandwidth * 1e6);

  console.log('Rendering ChartComponent with peaks:', peaks);

  return (
    <div>
      <Plot
        data={[
          {
            x: Array.isArray(fftData) ? fftData.map((_, index) => ((settings.frequency - settings.sampleRate / 2) + (index * settings.sampleRate / fftData.length)).toFixed(2)) : [],
            y: Array.isArray(fftData) ? fftData : [],
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'orange' },
            line: { shape: 'spline', width: 1 }, // Thinner trace lines
          },
        ]}
        layout={{
          title: `Spectrum Viewer (Time: ${time})`,
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
          margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
          },
          paper_bgcolor: '#000',
          plot_bgcolor: '#000',
          font: {
            color: 'white',
          },
          annotations: [...peakAnnotations, peakTableAnnotation].filter(Boolean),
        }}
        style={{ width: '100%', height: '40vh' }}
      />
      {showWaterfall && (
        <Plot
          data={[
            {
              z: waterfallData,
              type: 'heatmap',
              colorscale: 'Jet',
              zsmooth: 'fast',
              zmin: minY,
              zmax: maxY,
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
            },
            yaxis: {
              title: 'Samples',
              color: 'white',
              gridcolor: '#444',
            },
            margin: {
              l: 50,
              r: 50,
              b: 50,
              t: 0,
              pad: 4
            },
            paper_bgcolor: '#000',
            plot_bgcolor: '#000',
            font: {
              color: 'white',
            },
          }}
          config={{
            displayModeBar: false, // Hide the mode bar
          }}
          style={{ width: '100%', height: '40vh' }}
        />
      )}
    </div>
  );
};

export default ChartComponent;
