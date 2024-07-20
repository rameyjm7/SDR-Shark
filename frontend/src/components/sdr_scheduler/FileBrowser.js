import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  List, ListItem, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Button, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import config from '../../config';
import FileManager from './FileManager';

const FileBrowser = ({ onAnalyze }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = (path) => {
    console.log(`Fetching files in path: ${path}`);
    axios.get(`${config.base_url}/file_manager/files?path=${encodeURIComponent(path)}`)
      .then(response => {
        console.log('Files fetched:', response.data.files);
        setFiles(response.data.files);
        setMetadata(null);  // Clear metadata when changing directory
      })
      .catch(error => console.error('Error fetching files:', error));
  };

  const handleDirectoryClick = (file) => {
    if (file.isDir) {
      let newPath;
      if (file.name === '..') {
        // Navigate to parent directory
        newPath = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1);
      } else {
        newPath = normalizePath(`${currentPath}/${file.name}`);
      }
      setCurrentPath(newPath);
    } else {
      fetchFileMetadata(file);
    }
  };

  const fetchFileMetadata = (file) => {
    const fullPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`;
    console.log(`Fetching metadata for file: ${file.name} in path: ${currentPath}`);
    console.log(`Full path for metadata request: ${fullPath}`);
    axios.get(`${config.base_url}/file_manager/files/metadata`, {
      params: {
        path: file.name,
        current_dir: currentPath,
      }
    })
      .then(response => {
        console.log('Metadata fetched:', response.data.metadata);
        console.log('FFT data fetched:', response.data.fft_data);
        setSelectedFile(file);
        setMetadata(response.data.metadata);
        onAnalyze(file, response.data.fft_data, response.data.metadata); // Pass fft_data and metadata
      })
      .catch(error => console.error('Error fetching metadata:', error));
  };

  const handleCreateDirectory = () => {
    console.log(`Creating directory: ${newDirectoryName} in path: ${currentPath}`);
    axios.post(`${config.base_url}/file_manager/files/create_directory`, { path: currentPath, name: newDirectoryName })
      .then(response => {
        fetchFiles(currentPath);
        setDialogOpen(false);
        setNewDirectoryName('');
      })
      .catch(error => console.error('Error creating directory:', error));
  };

  const normalizePath = (path) => {
    return path.replace(/\/+/g, '/');
  };

  const handleMoveFile = (src, dest, name) => {
    axios.post(`${config.base_url}/file_manager/files/move`, { src, dest, name })
      .then(response => {
        fetchFiles(currentPath);
      })
      .catch(error => console.error('Error moving file:', error));
  };

  const handleHomeClick = () => {
    setCurrentPath('/');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={handleHomeClick}>Home</Button>
        <IconButton onClick={handleHomeClick}>
          <HomeIcon />
        </IconButton>
        <Button onClick={() => setDialogOpen(true)}>Create Directory</Button>
      </div>
      <Typography variant="h6">Current Directory: {currentPath}</Typography>
      <FileManager
        files={files}
        onDirectoryClick={handleDirectoryClick}
        onMoveFile={handleMoveFile}
        currentPath={currentPath}
        fetchFiles={fetchFiles}
        onAnalyze={(file) => {
          const relativePath = normalizePath(`${currentPath}/${file.name}`);
          console.log(`Analyzing file: ${relativePath}`);
          fetchFileMetadata(file);
        }}
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Directory</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Directory Name"
            type="text"
            fullWidth
            value={newDirectoryName}
            onChange={(e) => setNewDirectoryName(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleCreateDirectory(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDirectory}>Create</Button>
        </DialogActions>
      </Dialog>

      {metadata && (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Frequency (MHz)</TableCell>
                <TableCell>Bandwidth (MHz)</TableCell>
                <TableCell>Sample Rate (MHz)</TableCell>
                <TableCell>Gain</TableCell>
                <TableCell>Averaging</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{metadata.center_freq ? metadata.center_freq / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.bandwidth ? metadata.bandwidth / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.sample_rate ? metadata.sample_rate / 1e6 : 'N/A'}</TableCell>
                <TableCell>{metadata.gain !== undefined ? metadata.gain : 'N/A'}</TableCell>
                <TableCell>{metadata.averaging !== undefined ? metadata.averaging : 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default FileBrowser;
