import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data, minY, maxY, centerFreq, sampleRate }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const generateFrequencyLabels = () => {
    const numLabels = data.labels.length;
    const startFreq = centerFreq - (sampleRate / 2);
    const endFreq = centerFreq + (sampleRate / 2);
    const step = (endFreq - startFreq) / (numLabels - 1);
    return Array.from({ length: numLabels }, (_, index) => (startFreq + (index * step)).toFixed(2));
  };

  useEffect(() => {
    const labels = generateFrequencyLabels();

    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: data.datasets.map(dataset => ({
            ...dataset,
            pointRadius: dataset.pointRadius || 2,
          })),
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
              min: minY,
              max: maxY,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    } else if (chartInstance.current) {
      chartInstance.current.data.labels = labels;
      chartInstance.current.data.datasets = data.datasets.map(dataset => ({
        ...dataset,
        pointRadius: dataset.pointRadius || 1,
      }));
      chartInstance.current.options.scales.y.min = minY;
      chartInstance.current.options.scales.y.max = maxY;
      chartInstance.current.update('none');
    }
  }, [data, minY, maxY, centerFreq, sampleRate]);

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;
