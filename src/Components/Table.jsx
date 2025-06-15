import React, { useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    CardContent,
    styled,
    Card,
    useTheme,
    useMediaQuery,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(2),
    backgroundColor: '#ffffff',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.shadows[6],
    },
}));

const OrdersTable = ({
                         title = 'Recent Orders',
                         orderRows,
                         orderColumns,
                         paginationModel,
                         onPaginationModelChange,
                     }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState(orderColumns[0]?.field || '');

    // Filter rows based on search text and selected column
    const filteredRows = orderRows.filter((row) => {
        if (!searchText) return true;
        const cellValue = row[searchColumn]?.toString().toLowerCase();
        return cellValue?.includes(searchText.toLowerCase());
    });

    return (
        <Grid item xs={12}>
            <StyledCard>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            sx={{ fontWeight: 600 }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <FormControl
                                size="small"
                                sx={{ minWidth: 120 }}
                            >
                                <InputLabel>Search By</InputLabel>
                                <Select
                                    value={searchColumn}
                                    onChange={(e) => setSearchColumn(e.target.value)}
                                    label="Search By"
                                >
                                    {orderColumns.map((column) => (
                                        <MenuItem key={column.field} value={column.field}>
                                            {column.headerName || column.field}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                sx={{ width: isMobile ? '100%' : 200 }}
                            />
                        </Box>
                    </Box>
                    <Paper
                        sx={{
                            width: '100%',
                            overflowX: 'auto',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                minWidth: 600,
                                height: isMobile ? 300 : 400,
                            }}
                        >
                            <DataGrid
                                rows={filteredRows}
                                columns={orderColumns}
                                paginationModel={paginationModel}
                                onPaginationModelChange={onPaginationModelChange}
                                pageSizeOptions={[5, 10]}
                                sx={{
                                    border: 0,
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f1f5f9',
                                        color: '#1e293b',
                                        fontWeight: 600,
                                    },
                                    '& .MuiDataGrid-cell': {
                                        color: '#1e293b',
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        overflowY: 'auto',
                                    },
                                }}
                            />
                        </div>
                    </Paper>
                </CardContent>
            </StyledCard>
        </Grid>
    );
};

export default OrdersTable;