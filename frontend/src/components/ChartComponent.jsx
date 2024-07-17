import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data, minY, maxY, centerFreq, sampleRate }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Helper function to generate X-axis labels based on center frequency and sample rate
  const generateFrequencyLabels = () => {
    if (centerFreq && sampleRate) {
      const numLabels = data.labels.length;
      const startFreq = centerFreq - (sampleRate / 2);
      const endFreq = centerFreq + (sampleRate / 2);
      const step = (endFreq - startFreq) / (numLabels - 1);
      const labels = Array.from({ length: numLabels }, (_, index) => (startFreq + (index * step)).toFixed(2));
      console.log('Generated Frequency Labels:', labels);
      return labels;
    }
    return data.labels;
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
            pointRadius: 2,  // Smaller dots
          })),
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
    } else if (chartInstance.current) {
      chartInstance.current.data.labels = labels;
      chartInstance.current.data.datasets = data.datasets.map(dataset => ({
        ...dataset,
        pointRadius: 1,  // Smaller dots
      }));
      chartInstance.current.options.scales.y.min = minY;
      chartInstance.current.options.scales.y.max = maxY;
      chartInstance.current.update('none'); // Use 'none' to avoid animations
    }
  }, [data, minY, maxY, centerFreq, sampleRate]);

  return (
    <div style={{ width: '100%', height: '75vh' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;
