import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { Typography } from '@mui/material';

const ChartComponent = ({ minY, maxY, centerFreq, sampleRate }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [time, setTime] = useState('');
  const [fftData, setFftData] = useState([]);
  const [peaksData, setPeaksData] = useState([]);

  // Helper function to generate X-axis labels based on center frequency and sample rate
  const generateFrequencyLabels = (dataLength) => {
    const numLabels = dataLength;
    const startFreq = centerFreq - (sampleRate / 2);
    const endFreq = centerFreq + (sampleRate / 2);
    const step = (endFreq - startFreq) / (numLabels - 1);
    return Array.from({ length: numLabels }, (_, index) => (startFreq + (index * step)).toFixed(2));
  };

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0, // Disable animations for smoother updates
          },
          scales: {
            x: {
              ticks: { color: 'white' },
              grid: { color: '#444' },
              title: {
                display: true,
                text: 'Frequency (MHz)',
                color: 'white',
              },
            },
            y: {
              ticks: { color: 'white' },
              grid: { color: '#444' },
              min: minY,
              max: maxY,
            },
          },
          plugins: {
            legend: {
              display: false,  // Hide legend
            },
          },
        },
      });
    }
  }, [minY, maxY]);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    const debounceUpdate = (() => {
      let timer;
      return (callback, delay) => {
        clearTimeout(timer);
        timer = setTimeout(callback, delay);
      };
    })();

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const { fft, peaks, time } = parsedData;

        // Debugging output
        // console.log('Received FFT Data:', fft.slice(0, 10)); // Print first 10 points for brevity
        // console.log('Received Peaks:', peaks);
        // console.log('Received Time:', time);

        setTime(time || '');
        setFftData(fft);
        setPeaksData(peaks);

        debounceUpdate(() => {
          if (chartInstance.current) {
            const labels = generateFrequencyLabels(fft.length);
            chartInstance.current.data.labels = labels;
            chartInstance.current.data.datasets = [
              {
                label: 'FFT Data',
                data: fft,
                fill: false,
                backgroundColor: 'yellow',
                borderColor: 'orange',
                pointRadius: 2,  // Smaller dots
              },
              ...peaks.map((peak, index) => ({
                label: `Peak ${index + 1}`,
                data: [{ x: labels[peak], y: fft[peak] }],
                backgroundColor: 'red',
                borderColor: 'red',
                pointRadius: 5,
              })),
            ];
            chartInstance.current.update('none'); // Update chart without animation
          }
        }, 10); // Update chart at most every 100ms
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    eventSource.onopen = () => {
      console.log('EventSource connection opened.');
    };

    return () => {
      eventSource.close();
    };
  }, [centerFreq, sampleRate]);

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <canvas ref={chartRef}></canvas>
      <Typography variant="h6" style={{ color: 'white' }}>
        {time}
      </Typography>
    </div>
  );
};

export default ChartComponent;
