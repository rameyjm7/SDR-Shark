import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './components/ChartComponent';
import './App.css';
import 'chart.js/auto';

function App() {
  const [data, setData] = useState([]);
  const [time, setTime] = useState('');
  const [minY, setMinY] = useState(-60);
  const [maxY, setMaxY] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios('/api/data');
        setData(result.data.fft || []);
        setTime(result.data.time);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    };

    const interval = setInterval(fetchData, 33.33); // fetch new data every 30ms (30Hz)
    return () => clearInterval(interval); // cleanup
  }, []);

  const chartData = {
    labels: data.map((_, index) => index),
    datasets: [
      {
        label: 'FFT Data',
        data: data,
        fill: false,
        backgroundColor: 'yellow',
        borderColor: 'orange',
      },
    ],
  };

  return (
    <div className="App">
      <h1>FFT and Current Time</h1>
      <p>Current Time: {time}</p>
      <div className="sliders">
        <label>
          Min Y:
          <input
            type="range"
            min="-60"
            max="-20"
            value={minY}
            onChange={(e) => setMinY(Number(e.target.value))}
          />
          {minY}
        </label>
        <label>
          Max Y:
          <input
            type="range"
            min="20"
            max="60"
            value={maxY}
            onChange={(e) => setMaxY(Number(e.target.value))}
          />
          {maxY}
        </label>
      </div>
      <div className="chart-container">
        <ChartComponent data={chartData} minY={minY} maxY={maxY} />
      </div>
    </div>
  );
}

export default App;
