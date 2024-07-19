// import React, { useEffect, useRef, useState } from 'react';
// import Plot from 'react-plotly.js';

// const WaterfallPlot = () => {
//   const [fftData, setFftData] = useState([]);
//   const [timeData, setTimeData] = useState([]);
//   const plotRef = useRef();

//   useEffect(() => {
//     const eventSource = new EventSource('/api/stream');

//     eventSource.onmessage = (event) => {
//       const parsedData = JSON.parse(event.data);
//       const { fft, time } = parsedData;

//       // Debugging output
//       console.log('Received FFT Data:', fft);
//       console.log('Received Time Data:', time);

//       setFftData((prevData) => [...prevData.slice(-99), fft]);
//       setTimeData((prevTime) => [...prevTime.slice(-99), time]);

//       if (plotRef.current) {
//         plotRef.current.redraw();
//       }
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, []);

//   const createXAxis = () => {
//     // Assuming center frequency and sample rate are provided, otherwise default values
//     const centerFreq = 102.1; // Replace with actual center frequency in MHz
//     const sampleRate = 16; // Replace with actual sample rate in MHz

//     const startFreq = centerFreq - sampleRate / 2;
//     const endFreq = centerFreq + sampleRate / 2;
//     const step = sampleRate / (fftData[0] ? fftData[0].length : 1);
//     return Array.from({ length: fftData[0] ? fftData[0].length : 0 }, (_, i) => startFreq + i * step);
//   };

//   const xAxis = createXAxis();

//   return (
//     <div>
//       <Plot
//         ref={plotRef}
//         data={fftData.map((fft, index) => ({
//           x: xAxis,
//           y: fft,
//           type: 'scatter',
//           mode: 'lines+markers',
//           marker: { size: 3 },  // Smaller dots
//           name: timeData[index],
//           showlegend: false,  // Hide legend
//         }))}
//         layout={{
//           title: 'Waterfall Plot',
//           xaxis: {
//             title: 'Frequency (MHz)',
//           },
//           yaxis: {
//             title: 'Amplitude (dB)',
//           },
//           paper_bgcolor: 'black',
//           plot_bgcolor: 'black',
//           font: {
//             color: 'white',
//           },
//         }}
//         style={{ width: '100%', height: '100%' }}
//         config={{
//           displayModeBar: false,  // Hide mode bar (the toolbar that appears on the graph)
//         }}
//       />
//     </div>
//   );
// };

// export default WaterfallPlot;

import React from 'react';
import Plot from 'react-plotly.js';

const WaterfallPlot = ({ waterfallData, settings, minY, maxY }) => {
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

  return (
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
  );
};

export default WaterfallPlot;
