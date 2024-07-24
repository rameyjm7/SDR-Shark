import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const ChartComponent = ({ settings, sweepSettings, setSweepSettings, minY, maxY, updateInterval, waterfallSamples, showWaterfall }) => {
  const [fftData, setFftData] = useState([]);
  const [waterfallData, setWaterfallData] = useState([]);
  const [time, setTime] = useState('');
  const [peaks, setPeaks] = useState([]);
  const prevTickValsRef = useRef([]);
  const prevTickTextRef = useRef([]);
  const [currentFrequency, setCurrentFrequency] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.139.1.185:5000/api/data');
        const data = response.data;
        setFftData(data.fft);
        setWaterfallData(data.waterfall.slice(-waterfallSamples));
        setTime(data.time);
    
        if (data.settings.sweeping_enabled) {
          setSweepSettings({
            frequency_start: data.settings.sweep_settings.frequency_start,
            frequency_stop: data.settings.sweep_settings.frequency_stop,
            sweeping_enabled: data.settings.sweeping_enabled,
            bandwidth: data.settings.sweep_settings.frequency_stop - data.settings.sweep_settings.frequency_start,
          });
    
          const currentFreq = data.settings.center_freq;
          setCurrentFrequency(currentFreq);
        } else {
          setCurrentFrequency(settings.frequency * 1e6);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    const interval = setInterval(fetchData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval, waterfallSamples, setSweepSettings, settings.frequency, settings.sampleRate]);

  useEffect(() => {
    const fetchPeaks = async () => {
      try {
        const response = await axios.get('http://10.139.1.185:5000/api/analytics');
        setPeaks(response.data.peaks);
      } catch (error) {
        console.error('Error fetching peaks:', error);
      }
    };

    const interval = setInterval(fetchPeaks, 500);
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

  const generateTickValsAndLabels = (startFreq, stopFreq) => {
    const numTicks = settings.numTicks || 5; // Default to 5 if not set
    const totalBandwidth = stopFreq - startFreq;
    const step = totalBandwidth / (numTicks - 1); // Adjust step calculation for numTicks

    const tickVals = [];
    const tickText = [];
    for (let i = 0; i < numTicks; i++) {
      const freq = startFreq + i * step;
      tickVals.push(freq);
      tickText.push((freq / 1e6).toFixed(2)); // Convert to MHz
    }
    tickVals.push(stopFreq*0.999);
    tickText.push((stopFreq / 1e6).toFixed(2)); // Convert to MHz

    return { tickVals, tickText };
  };

  const { tickVals, tickText } = generateTickValsAndLabels(
    sweepSettings.sweeping_enabled ? sweepSettings.frequency_start : (settings.frequency - settings.sampleRate / 2) * 1e6,
    sweepSettings.sweeping_enabled ? sweepSettings.frequency_stop : (settings.frequency + settings.sampleRate / 2) * 1e6
  );

  // Ensure tick values are within a valid range
  const isValidTickVals = tickVals.every(val => val >= 1e6 && val <= 1e10); // Adjust range as necessary

  if (isValidTickVals) {
    if (
      JSON.stringify(tickVals) !== JSON.stringify(prevTickValsRef.current) ||
      JSON.stringify(tickText) !== JSON.stringify(prevTickTextRef.current)
    ) {
      prevTickValsRef.current = tickVals;
      prevTickTextRef.current = tickText;
    }
  } else {
    // Log an error message if the tick values are out of range
    console.error("Tick values out of range:", tickVals);
  }

  // Add an extra point at the end of the range
  const extendedFftData = [...fftData];
  if (extendedFftData.length > 0) {
    const lastFrequency = sweepSettings.sweeping_enabled ? sweepSettings.frequency_stop : (settings.frequency + settings.sampleRate / 2) * 1e6;
    extendedFftData.push(extendedFftData[extendedFftData.length - 1]);
    extendedFftData[extendedFftData.length - 1] = {
      ...extendedFftData[extendedFftData.length - 1],
      x: lastFrequency
    };
  }

  return (
    <div>
      <Plot
        data={[
          {
            x: Array.isArray(extendedFftData) ? extendedFftData.map((_, index) => {
              const baseFreq = sweepSettings.sweeping_enabled ? sweepSettings.frequency_start : (settings.frequency - settings.sampleRate / 2) * 1e6;
              const freqStep = (sweepSettings.sweeping_enabled ? sweepSettings.bandwidth : settings.sampleRate * 1e6) / extendedFftData.length;
              return (baseFreq + index * freqStep).toFixed(2);
            }) : [],
            y: Array.isArray(extendedFftData) ? extendedFftData : [],
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'orange' },
            line: { shape: 'spline', width: 1 }, // Thinner trace lines
          },
        ]}
        layout={{
          title: `Spectrum Viewer (Time: ${time}) (Freq: ${currentFrequency / 1e6})`,
          xaxis: {
            title: 'Frequency (MHz)',
            color: 'white',
            gridcolor: '#444',
            tickvals: prevTickValsRef.current,
            ticktext: prevTickTextRef.current,
          },
          yaxis: {
            title: 'Amplitude (dB)',
            range: [minY, maxY],
            color: 'white',
            gridcolor: '#444',
            zeroline: false // Remove the white line across the 0 mark
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
              zeroline: false, // Remove the white line across the 0 mark
              tickvals: prevTickValsRef.current,
              ticktext: prevTickTextRef.current,
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
