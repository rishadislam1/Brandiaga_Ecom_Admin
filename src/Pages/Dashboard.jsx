import React, {useEffect, useState} from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    styled,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {DashboardSummary} from "../Request/DashboardRequest.jsx";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Table from "../Components/Table.jsx";

// Demo data for orders
const orderColumns = [
    { field: 'id', headerName: 'Order ID', width: 100 },
    { field: 'customerName', headerName: 'Customer Name', width: 200 },
    { field: 'product', headerName: 'Product', width: 150 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 120 },
    {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => (
            <span
                style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor:
                        params.value === 'Completed'
                            ? '#DCFCE7'
                            : params.value === 'Pending'
                                ? '#FEF9C3'
                                : '#FEE2E2',
                    color:
                        params.value === 'Completed'
                            ? '#15803D'
                            : params.value === 'Pending'
                                ? '#CA8A04'
                                : '#B91C1C',
                }}
            >
        {params.value}
      </span>
        ),
    },
];

const orderRows = [
    { id: 1, customerName: 'John Doe', product: 'Product A', amount: 120.50, status: 'Completed' },
    { id: 2, customerName: 'Jane Smith', product: 'Product B', amount: 89.99, status: 'Pending' },
    { id: 3, customerName: 'Alice Johnson', product: 'Product C', amount: 45.00, status: 'Cancelled' },
    { id: 4, customerName: 'Bob Wilson', product: 'Product A', amount: 200.75, status: 'Completed' },
    { id: 5, customerName: 'Emma Brown', product: 'Product B', amount: 65.30, status: 'Pending' },
];



// Styled card component
const StyledCard = styled(Card)(({ theme }) => ({
    boxShadow: theme.shadows[8],
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: '#ffffff',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[12],
    },
}));

// Styled typography for metrics
const MetricTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    color: theme.palette.primary.dark,
    fontSize: '1.75rem',
}));

const Dashboard = () => {

    const [salesData,setSalesData] = useState([
        { name: 'Jan', sales: 4000 },
        { name: 'Feb', sales: 3000 },
        { name: 'Mar', sales: 5000 },
        { name: 'Apr', sales: 4500 },
        { name: 'May', sales: 6000 },
        { name: 'Jun', sales: 5500 },
    ]) ;

    const [metrics, setMetrics] = useState({});
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });



    useEffect(() => {
        // Send data to backend when any state changes
        const payload = {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
        };

        // Example: Send to backend
        console.log('Sending to backend:', payload);
        // axios.post('/api/sync-state', payload);
    }, [paginationModel]);

    useEffect(() => {
        (async ()=>{
            const res = await DashboardSummary();
            setMetrics(res.data);
        })()
    },[]);
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box
            sx={{
                p: {
                    xs: 0,
                    sm: 3,
                    md: 3,
                    lg: 4,
                },
                bgcolor: '#f8fafc',
                minHeight: '100vh',
                fontFamily: '"Roboto", sans-serif',
            }}
        >
            <Typography
                variant={isSmall ? 'h6' : 'h3'}

                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 5,
                    textAlign: 'center',
                }}
            >
                eCommerce Analytics Dashboard
            </Typography>

            <Grid container spacing={8}>
                {/* Key Metrics Cards */}
                <Grid size={{ xs: 12, md: 6, lg:2.4 }} item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Revenue
                            </Typography>
                            <MetricTypography>{metrics?.totalRevenue}</MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg:2.4 }} item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Products
                            </Typography>
                            <MetricTypography>{metrics?.totalProducts}</MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg:2.4 }} item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Average Order Value
                            </Typography>
                            <MetricTypography>{metrics?.averageOrderValue}</MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg:2.4 }} item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Conversion Rate
                            </Typography>
                            <MetricTypography>{metrics?.conversionRate}</MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid  size={{ xs: 12, md: 6, lg:2.4 }} item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Cart Abandonment
                            </Typography>
                            <MetricTypography sx={{ color: '#b91c1c' }}>
                                {metrics?.cartAbandonmentRate}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Sales Over Time Chart */}
                <Grid  size={12} item xs={12} md={8}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Sales Over Time
                            </Typography>
                            <Box sx={{ height: 350, mt: 2 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={14} />
                                        <YAxis stroke="#64748b" fontSize={14} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Grid>



                <Table
                    orderRows={orderRows}
                    orderColumns={orderColumns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}


                />
                {/* Customer Metrics */}
                <Grid size={{ xs: 12, md: 4, lg:4 }} item xs={12} sm={6}>
                    <div >
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Total Orders
                                </Typography>
                                <MetricTypography sx={{color: '#15803d'}}>
                                    {metrics?.totalOrders}
                                </MetricTypography>
                            </CardContent>
                        </StyledCard>
                    </div>
                    <div className={`mt-5`}>
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Total Customers
                                </Typography>
                                <MetricTypography sx={{color: '#15803d'}}>
                                    {metrics?.newCustomers}
                                </MetricTypography>
                            </CardContent>
                        </StyledCard>
                    </div>
                    <div className={`mt-5`}>
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Returning Customers
                                </Typography>
                                <MetricTypography sx={{color: '#15803d'}}>
                                    {metrics?.returningCustomers}
                                </MetricTypography>
                            </CardContent>
                        </StyledCard>
                    </div>
                </Grid>

            </Grid>
        </Box>
    );
};

export default Dashboard;