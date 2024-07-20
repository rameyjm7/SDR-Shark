import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import TaskForm from './sdr_scheduler/TaskForm';
import TaskList from './sdr_scheduler/TaskList';

const Actions = ({ tasks, setTasks }) => {
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/actions/tasks');
        setTasks(response.data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [setTasks]);

  const handleExecuteTasks = async () => {
    try {
      const response = await axios.post('/actions/tasks/execute', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Tasks executed:', response.data);
    } catch (error) {
      console.error('Error executing tasks:', error);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await axios.post('/actions/tasks', newTask, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Actions</Typography>
      <TaskForm addTask={handleAddTask} />
      <TaskList tasks={tasks} />
      <Button variant="contained" color="secondary" onClick={handleExecuteTasks} sx={{ mt: 2 }}>
        Execute Tasks
      </Button>
    </Box>
  );
};

export default Actions;
