import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { debounce } from 'lodash';

const ChartComponent = ({ settings }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [throttleInterval, setThrottleInterval] = useState(settings.throttleInterval || 10);

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'FFT Data',
              data: [],
              fill: false,
              backgroundColor: 'yellow',
              borderColor: 'orange',
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0,
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
              min: settings.minY,
              max: settings.maxY,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.options.scales.y.min = settings.minY;
      chartInstance.current.options.scales.y.max = settings.maxY;
      chartInstance.current.update('none');
    }
  }, [settings.minY, settings.maxY]);

  const updateChart = (data, time) => {
    if (chartInstance.current) {
      const chart = chartInstance.current;
      chart.data.labels = data.map((_, index) => index);
      chart.data.datasets[0].data = data;
      chart.update('none');
    }
  };

  const throttledUpdateChart = debounce(updateChart, throttleInterval);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');
    eventSource.onmessage = (event) => {
      const { fft, time } = JSON.parse(event.data);
      throttledUpdateChart(fft, time);
    };

    return () => {
      eventSource.close();
    };
  }, [throttleInterval]);

  useEffect(() => {
    setThrottleInterval(settings.throttleInterval);
  }, [settings.throttleInterval]);

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;
