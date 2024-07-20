import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, Menu, MenuItem, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ContextMenuTrigger } from 'react-contextmenu';
import axios from 'axios';
import config from '../../config';

const FileManager = ({ files, onDirectoryClick, onMoveFile, currentPath, fetchFiles, onAnalyze }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newName, setNewName] = useState('');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const srcPath = `${currentPath}/${result.draggableId}`;
    let destPath;
    if (result.destination.index === 0) {
      // Move to parent directory
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1);
      destPath = parentPath;
    } else {
      const targetFile = files[result.destination.index - 1];
      if (!targetFile.isDir) {
        console.warn('Cannot move file onto another file');
        return; // Don't allow moving a file onto another file
      }
      destPath = `${currentPath}/${targetFile.name}`;
    }

    destPath = destPath.replace(/\/+/g, '/');
    console.log('Source Path:', srcPath);
    console.log('Current Path:', currentPath);
    console.log('File:', result.draggableId);
    console.log('Destination:', destPath);
    onMoveFile(srcPath, destPath, result.draggableId);
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
    setSelectedFile(null);
  };

  const handleDelete = () => {
    axios.post(`${config.base_url}/file_manager/files/delete`, { path: `${currentPath}${selectedFile.name}` })
      .then(response => {
        fetchFiles(currentPath);
      })
      .catch(error => console.error('Error deleting file:', error));
    handleClose();
  };

  const handleRename = () => {
    setNewName(selectedFile.name);
    setRenameDialogOpen(true);
    handleClose();
  };

  const handleRenameSubmit = () => {
    if (selectedFile && newName.trim()) {
      axios.post(`${config.base_url}/file_manager/files/rename`, { old_path: `${currentPath}${selectedFile.name}`, new_path: `${currentPath}${newName}` })
        .then(response => {
          fetchFiles(currentPath);
          setRenameDialogOpen(false);
          setSelectedFile(null);
        })
        .catch(error => console.error('Error renaming file:', error));
    }
  };

  const handleDialogClose = () => {
    setRenameDialogOpen(false);
    setSelectedFile(null);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
      handleClose();
    }
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fileList">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              <Draggable draggableId="parent-directory" index={0} isDragDisabled>
                {(provided) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    button
                    onClick={() => onDirectoryClick({ name: '..', isDir: true })}
                  >
                    <ListItemText primary="Parent Directory" />
                  </ListItem>
                )}
              </Draggable>
              {files.map((file, index) => (
                <ContextMenuTrigger id="contextmenu" key={file.id} holdToDisplay={-1}>
                  <Draggable draggableId={file.id} index={index + 1}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        button
                        onClick={() => file.isDir ? onDirectoryClick(file) : null}
                        onContextMenu={(event) => handleContextMenu(event, file)}
                      >
                        <ListItemText primary={file.name} />
                      </ListItem>
                    )}
                  </Draggable>
                </ContextMenuTrigger>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem onClick={handleAnalyze}>Analyze</MenuItem>
      </Menu>

      <Dialog open={renameDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Rename File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the new name for the file or folder.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleRenameSubmit}>Rename</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Size (bytes)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Frequency (MHz)</TableCell>
              <TableCell>Bandwidth (MHz)</TableCell>
              <TableCell>Sample Rate (MHz)</TableCell>
              <TableCell>Gain</TableCell>
              <TableCell>Averaging</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.date}</TableCell>
                <TableCell>{file.isDir ? 'Directory' : 'File'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.label : '-'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.center_freq / 1e6 : '-'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.bandwidth / 1e6 : '-'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.sample_rate / 1e6 : '-'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.gain : '-'}</TableCell>
                <TableCell>{file.metadata ? file.metadata.fft_averaging : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FileManager;
