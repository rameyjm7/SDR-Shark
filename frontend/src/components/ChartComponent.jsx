import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data, minY, maxY }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets,
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
              labels: {
                color: 'white',
              },
            },
          },
        },
      });
    } else if (chartInstance.current) {
      chartInstance.current.data.labels = data.labels;
      chartInstance.current.data.datasets = data.datasets;
      chartInstance.current.options.scales.y.min = minY;
      chartInstance.current.options.scales.y.max = maxY;
      chartInstance.current.update('none'); // Use 'none' to avoid animations
    }
  }, [data, minY, maxY]);

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;
