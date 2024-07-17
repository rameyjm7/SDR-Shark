import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist';

const WaterfallPlot = ({ data, freqs }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length || !freqs.length) {
      console.error("Invalid data format received for waterfall plot:", data);
      return;
    }

    const trace = {
      x: freqs,
      y: Array.from({ length: data.length }, (_, i) => data.length - i),
      z: data,
      type: 'heatmap',
      colorscale: 'Jet',
      showscale: true,  // Display color scale for the spectrogram
    };

    const layout = {
      paper_bgcolor: 'black',
      plot_bgcolor: '#333',
      margin: { t: 0 },
      yaxis: {
        title: 'Time',
        showgrid: false,
        zeroline: false,
        autorange: 'reversed',
        color: 'white',
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        range: [freqs[0], freqs[freqs.length - 1]],
        color: 'white',
      },
    };

    Plotly.newPlot(plotRef.current, [trace], layout);
  }, [data, freqs]);

  return (
    <div ref={plotRef} style={{ width: '100%', height: '50vh' }}></div>
  );
};

export default WaterfallPlot;
