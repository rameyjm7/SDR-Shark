import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Dialog, DialogContent } from '@mui/material';

const SigDex = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios.get('/sigid/data')
      .then(response => {
        const signalsData = response.data.signals_database;
        const formattedRows = Object.entries(signalsData).map(([key, value], index) => ({
          id: index, // Ensure unique id for each row
          ...value
        }));
        setRows(formattedRows);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'Signal type', headerName: 'Signal Type', width: 200 },
    { field: 'Description', headerName: 'Description', width: 400 },
    { field: 'Frequency', headerName: 'Frequency', width: 150 },
    { field: 'Mode', headerName: 'Mode', width: 100 },
    { field: 'Modulation', headerName: 'Modulation', width: 150 },
    { field: 'Bandwidth', headerName: 'Bandwidth', width: 150 },
    { field: 'Location', headerName: 'Location', width: 150 },
    { field: 'Audio', headerName: 'Audio', width: 200 },
    {
      field: 'Image',
      headerName: 'Image',
      width: 150,
      renderCell: (params) => (
        params.value ? <img src={`data:image/png;base64,${params.value}`} alt="Signal" style={{ width: '100%', cursor: 'pointer' }} onClick={() => setSelectedImage(params.value)} /> : 'No Image'
      )
    },
    // Add more columns as needed
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        loading={loading}
      />
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <DialogContent>
          {selectedImage && <img src={`data:image/png;base64,${selectedImage}`} alt="Signal" style={{ width: '100%' }} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SigDex;
