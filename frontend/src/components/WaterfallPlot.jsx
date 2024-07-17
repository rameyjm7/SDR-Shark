import React, { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';

const WaterfallPlot = () => {
  const [fftData, setFftData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const plotRef = useRef();

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const { fft, time } = parsedData;

      // Debugging output
      console.log('Received FFT Data:', fft);
      console.log('Received Time Data:', time);

      setFftData((prevData) => [...prevData.slice(-99), fft]);
      setTimeData((prevTime) => [...prevTime.slice(-99), time]);

      if (plotRef.current) {
        plotRef.current.redraw();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const createXAxis = () => {
    // Assuming center frequency and sample rate are provided, otherwise default values
    const centerFreq = 102.1; // Replace with actual center frequency in MHz
    const sampleRate = 16; // Replace with actual sample rate in MHz

    const startFreq = centerFreq - sampleRate / 2;
    const endFreq = centerFreq + sampleRate / 2;
    const step = sampleRate / (fftData[0] ? fftData[0].length : 1);
    return Array.from({ length: fftData[0] ? fftData[0].length : 0 }, (_, i) => startFreq + i * step);
  };

  const xAxis = createXAxis();

  return (
    <div>
      <Plot
        ref={plotRef}
        data={fftData.map((fft, index) => ({
          x: xAxis,
          y: fft,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { size: 3 },  // Smaller dots
          name: timeData[index],
          showlegend: false,  // Hide legend
        }))}
        layout={{
          title: 'Waterfall Plot',
          xaxis: {
            title: 'Frequency (MHz)',
          },
          yaxis: {
            title: 'Amplitude (dB)',
          },
          paper_bgcolor: 'black',
          plot_bgcolor: 'black',
          font: {
            color: 'white',
          },
        }}
        style={{ width: '100%', height: '100%' }}
        config={{
          displayModeBar: false,  // Hide mode bar (the toolbar that appears on the graph)
        }}
      />
    </div>
  );
};

export default WaterfallPlot;
