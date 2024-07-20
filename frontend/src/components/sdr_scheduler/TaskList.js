import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List, ListItem, ListItemText, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const TaskList = ({ tasks, onDragEnd, duplicateTask, deleteTask, currentTaskIndex }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <Paper {...provided.droppableProps} ref={provided.innerRef} style={{ padding: 16, backgroundColor: '#000' }}>
            <List>
              {tasks.map((task, index) => (
                <Draggable key={index} draggableId={index.toString()} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        marginBottom: 8,
                        backgroundColor: index === currentTaskIndex ? 'green' : '#333',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        ...provided.draggableProps.style,
                      }}
                    >
                      <ListItemText primary={
                        task.type === 'tune'
                          ? `Tune to ${task.frequency / 1e6} MHz`
                          : task.type === 'record'
                          ? `Record for ${task.duration} seconds with label ${task.label}`
                          : task.type === 'gain'
                          ? `Set gain to ${task.value}`
                          : task.type === 'bandwidth'
                          ? `Set bandwidth to ${task.value / 1e6} MHz`
                          : task.type === 'sweep'
                          ? task.sweepType === 'full'
                            ? `Sweep full bandwidth, dwell for ${task.dwellTime} seconds`
                            : `Sweep from ${task.startFreq / 1e6} MHz to ${task.endFreq / 1e6} MHz, dwell for ${task.dwellTime} seconds`
                          : ''
                      } />
                      <div>
                        <IconButton onClick={() => duplicateTask(index)} color="primary">
                          <FileCopyIcon />
                        </IconButton>
                        <IconButton onClick={() => deleteTask(index)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          </Paper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
