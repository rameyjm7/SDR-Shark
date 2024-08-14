import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ClassifierUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage('Uploading...');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload_classifier', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setStatusMessage(response.data.message);
      onUploadSuccess();
    } catch (error) {
      setStatusMessage('Upload failed.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('/api/download_all_bands', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all_bands.json'); // or .csv based on format
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setStatusMessage('Download failed.');
      console.error('Download error:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Load Classifiers
      </Typography>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed grey',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          backgroundColor: isDragActive ? '#f0f0f0' : '#ffffff',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey' }} />
        <Typography variant="body1" sx={{ mt: 1 }}>
          {isDragActive ? 'Drop files here...' : 'Drag and drop a file here, or click to select files'}
        </Typography>
      </Box>
      {uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download All Bands
        </Button>
        {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        <Typography variant="body2" sx={{ ml: 2 }}>
          {statusMessage}
        </Typography>
      </Box>
    </Box>
  );
};

export default ClassifierUploader;
