const generateColor = (value) => {
  if (value >= 0) {
    return 'rgb(0, 255, 0)';
  } else if (value >= -10) {
    const ratio = (value + 10) / 10;
    const red = Math.floor(255 * (1 - ratio));
    const green = 255;
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  } else if (value >= -20) {
    const ratio = (value + 20) / 10;
    const red = 255;
    const green = Math.floor(255 * ratio);
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    return 'rgb(255, 0, 0)';
  }
};

const generateAnnotations = (peaks) => {
  if (!settings.peakDetection || !Array.isArray(peaks)) return [];
  return peaks.map((peak) => {
    const freq = peak.frequency.toFixed(2);
    const power = peak.power.toFixed(2);
    const powerColor = generateColor(power);
    return {
      x: parseFloat(freq),
      y: parseFloat(power),
      xref: 'x',
      yref: 'y',
      text: `${freq} MHz<br><span style="color:${powerColor}">${power} dB</span>`,
      showarrow: true,
      arrowhead: 2,
      ax: 0,
      ay: -40,
      font: {
        size: 12,
        color: 'white',
      },
      align: 'center',
    };
  });
};

const generatePeakTableAnnotation = (peaks) => {
  if (!settings.peakDetection || !Array.isArray(peaks) || peaks.length === 0) return null;

  const rows = peaks.map((peak, index) => {
    const freq = peak.frequency.toFixed(2);
    const power = peak.power.toFixed(2);
    return `Peak ${index + 1} | ${freq} MHz | ${power} dB<br>`;
  }).join('');

  const tableText = rows;

  return {
    x: 1,
    y: 1,
    xref: 'paper',
    yref: 'paper',
    text: tableText,
    showarrow: false,
    font: {
      size: 12,
      family: 'monospace',
      color: 'white',
    },
    align: 'left',
    bgcolor: 'rgba(0, 0, 0, 0.7)',
    bordercolor: 'white',
    borderwidth: 1,
    xanchor: 'right',
    yanchor: 'top',
    pad: {
      t: 10,
      r: 10,
      b: 10,
      l: 10,
    },
  };
};
