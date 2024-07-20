import React, { useState } from 'react';
import { TextField, MenuItem, Button, Select, FormControl, InputLabel } from '@mui/material';

const TaskForm = ({ addTask }) => {
  const [taskType, setTaskType] = useState('tune');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [gain, setGain] = useState('');
  const [bandwidth, setBandwidth] = useState('');
  const [label, setLabel] = useState('');
  const [sweepType, setSweepType] = useState('full');
  const [startFreq, setStartFreq] = useState('');
  const [endFreq, setEndFreq] = useState('');
  const [dwellTime, setDwellTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting task: ${taskType} - Frequency: ${frequency} MHz, Duration: ${duration}, Gain: ${gain}, Bandwidth: ${bandwidth}, Label: ${label}, SweepType: ${sweepType}, StartFreq: ${startFreq}, EndFreq: ${endFreq}, DwellTime: ${dwellTime}`);
    if (taskType === 'tune') {
      addTask({ type: 'tune', frequency: parseFloat(frequency) * 1e6 });
    } else if (taskType === 'record') {
      addTask({ type: 'record', duration: parseFloat(duration), label });
    } else if (taskType === 'gain') {
      addTask({ type: 'gain', value: parseInt(gain, 10) });
    } else if (taskType === 'bandwidth') {
      addTask({ type: 'bandwidth', value: parseFloat(bandwidth) * 1e6 });
    } else if (taskType === 'sweep') {
      const sweepTask = { type: 'sweep', sweepType, dwellTime: parseFloat(dwellTime) };
      if (sweepType === 'range') {
        sweepTask.startFreq = parseFloat(startFreq) * 1e6;
        sweepTask.endFreq = parseFloat(endFreq) * 1e6;
      }
      addTask(sweepTask);
    }
    setFrequency('');
    setDuration('');
    setGain('');
    setBandwidth('');
    setLabel('');
    setSweepType('full');
    setStartFreq('');
    setEndFreq('');
    setDwellTime('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Task Type</InputLabel>
        <Select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          label="Task Type"
        >
          <MenuItem value="tune">Tune</MenuItem>
          <MenuItem value="record">Record</MenuItem>
          <MenuItem value="gain">Set Gain</MenuItem>
          <MenuItem value="bandwidth">Set Bandwidth</MenuItem>
          <MenuItem value="sweep">Sweep</MenuItem>
        </Select>
      </FormControl>
      {taskType === 'tune' && (
        <TextField
          label="Frequency (MHz)"
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ step: "0.001" }}
          required
        />
      )}
      {taskType === 'record' && (
        <>
          <TextField
            label="Duration (seconds)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </>
      )}
      {taskType === 'gain' && (
        <TextField
          label="Gain (0-40)"
          type="number"
          value={gain}
          onChange={(e) => setGain(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
      )}
      {taskType === 'bandwidth' && (
        <TextField
          label="Bandwidth (0.25-20 MHz)"
          type="number"
          value={bandwidth}
          onChange={(e) => setBandwidth(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ min: 0.25, max: 20, step: "0.01" }}
          required
        />
      )}
      {taskType === 'sweep' && (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel>Sweep Type</InputLabel>
            <Select
              value={sweepType}
              onChange={(e) => setSweepType(e.target.value)}
              label="Sweep Type"
            >
              <MenuItem value="full">Full Bandwidth</MenuItem>
              <MenuItem value="range">Frequency Range</MenuItem>
            </Select>
          </FormControl>
          {sweepType === 'range' && (
            <>
              <TextField
                label="Start Frequency (MHz)"
                type="number"
                value={startFreq}
                onChange={(e) => setStartFreq(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.001" }}
                required
              />
              <TextField
                label="End Frequency (MHz)"
                type="number"
                value={endFreq}
                onChange={(e) => setEndFreq(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.001" }}
                required
              />
            </>
          )}
          <TextField
            label="Dwell Time (seconds)"
            type="number"
            value={dwellTime}
            onChange={(e) => setDwellTime(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </>
      )}
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Task
      </Button>
    </form>
  );
};

export default TaskForm;
