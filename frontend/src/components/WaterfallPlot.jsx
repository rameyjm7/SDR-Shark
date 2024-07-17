import React, { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';

const WaterfallPlot = () => {
  const [fftData, setFftData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [centerFreq, setCenterFreq] = useState(102.1); // Default value, will be updated
  const [sampleRate, setSampleRate] = useState(16); // Default value, will be updated
  const plotRef = useRef();

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const { fft, time, metadata } = parsedData;

      // Debugging output
      console.log('Received FFT Data:', fft);
      console.log('Received Time Data:', time);
      console.log('Received Metadata:', metadata);

      setFftData((prevData) => [...prevData.slice(-99), fft]);
      setTimeData((prevTime) => [...prevTime.slice(-99), time]);

      // Update center frequency and sample rate based on metadata
      if (metadata) {
        setCenterFreq(metadata.center_freq / 1e6);
        setSampleRate(metadata.sample_rate / 1e6);
      }

      if (plotRef.current) {
        plotRef.current.redraw();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const createXAxis = () => {
    const startFreq = centerFreq - sampleRate / 2;
    const endFreq = centerFreq + sampleRate / 2;
    const step = sampleRate / (fftData[0] ? fftData[0].length : 1);
    console.log('X-Axis Start:', startFreq, 'End:', endFreq, 'Step:', step);
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
          mode: 'lines',
          name: timeData[index],
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
      />
    </div>
  );
};

export default WaterfallPlot;
