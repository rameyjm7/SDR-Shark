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
          showscale: false, // Disable the color scale
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
        showscale: false,
      }}
      style={{ width: '100%', height: '40vh' }}
    />
  );
};

export default WaterfallPlot;
