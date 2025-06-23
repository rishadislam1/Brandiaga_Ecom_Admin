import React, {useEffect, useState, useCallback} from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    CircularProgress,
    TextField,
    styled,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {DashboardSummary} from '../Request/DashboardRequest.jsx';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {useDispatch, useSelector} from 'react-redux';
import {showError} from '../Components/ToasterComponent.jsx';
import {setLoading} from '../redux/Slicers/LoadingSlice.js';
import Table from '../Components/Table.jsx';
import _ from 'lodash'; // For debouncing
import moment from 'moment';
import {GetOrdersRequest} from "../Request/OrderRequest.jsx"; // For date manipulation

// Styled Card component
const StyledCard = styled(Card)(({theme}) => ({
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
const MetricTypography = styled(Typography)(({theme}) => ({
    fontWeight: 700,
    color: theme.palette.primary.dark,
    fontSize: '1.75rem',
}));

const Dashboard = () => {
    const dispatch = useDispatch();
    const {isLoading} = useSelector((state) => state.loading);
    const [salesData, setSalesData] = useState([]);
    const [metrics, setMetrics] = useState({});
    const [orders, setOrders] = useState([]);
    const [paginationModel, setPaginationModel] = useState({page: 0, pageSize: 6});
    const [timePeriod, setTimePeriod] = useState('monthly');
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const orderColumns = [
        {field: 'orderId', headerName: 'Order ID', width: 200},
        {field: 'userEmail', headerName: 'Customer Email', width: 200},
        {
            field: 'product',
            headerName: 'Product',
            width: 150,
            renderCell: (params) => (
                <Box>
                    {params.row.orderItems.map((item, index) => (
                        <div key={index}>
                            {item.productName || 'N/A'} (Qty: {item.quantity || 'N/A'})
                        </div>
                    ))}
                </Box>
            ),
        },
        {field: 'totalAmount', headerName: 'Amount ($)', type: 'number', width: 120},
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
                            params.value === 'Delivered'
                                ? '#DCFCE7'
                                : params.value === 'Pending'
                                    ? '#FEF9C3'
                                    : params.value === 'Cancelled'
                                        ? '#FEE2E2'
                                        : params.value === 'Shipped'
                                            ? '#E0F2FE'
                                            : '#E0E7FF', // Processing
                        color:
                            params.value === 'Delivered'
                                ? '#15803D'
                                : params.value === 'Pending'
                                    ? '#CA8A04'
                                    : params.value === 'Cancelled'
                                        ? '#B91C1C'
                                        : params.value === 'Shipped'
                                            ? '#1E40AF'
                                            : '#5B21B6', // Processing
                    }}
                >
                    {params.value || 'Pending'}
                </span>
            ),
        },
    ];

    // Debounced search handler
    const debouncedSearch = useCallback(
        _.debounce(() => {
            setPaginationModel((prev) => ({...prev, page: 0}));
        }, 500),
        []
    );

    // Function to aggregate sales data by time period
    const aggregateSalesData = (orders, period) => {
        const salesMap = {};

        orders.forEach((order) => {
            const date = moment(order.orderDate);
            let key;

            if (period === 'daily') {
                key = date.format('YYYY-MM-DD');
            } else if (period === 'weekly') {
                key = date.startOf('week').format('YYYY-MM-DD');
            } else {
                key = date.format('YYYY-MM');
            }

            if (!salesMap[key]) {
                salesMap[key] = {name: key, sales: 0};
            }
            salesMap[key].sales += order.totalAmount || 0;
        });

        const salesArray = Object.values(salesMap).sort((a, b) =>
            moment(a.name).diff(moment(b.name))
        );


        // Format the name for display
        salesArray.forEach((item) => {
            if (period === 'daily') {
                item.name = moment(item.name).format('MMM DD');
            } else if (period === 'weekly') {
                item.name = `Week of ${moment(item.name).format('MMM DD')}`;
            } else {
                item.name = moment(item.name).format('MMM YYYY');
            }
        });

        return salesArray;
    };

    // Fetch all data concurrently
    useEffect(() => {
        const fetchData = async () => {
            dispatch(setLoading(true));
            try {
                const [summaryRes, ordersRes] = await Promise.all([
                    DashboardSummary(),
                    GetOrdersRequest({
                        page: paginationModel.page,
                        pageSize: paginationModel.pageSize,
                        search: searchQuery || undefined,
                    }),
                ]);

                // Set metrics
                if (summaryRes?.data) {
                    setMetrics(summaryRes.data);
                }

                // Set orders
                if (ordersRes?.data?.length) {
                    const transformed = ordersRes.data.map((item, index) => ({
                        id: index + 1 + paginationModel.page * paginationModel.pageSize,
                        orderId: item.orderId || 'N/A',
                        userEmail: item.userEmail || 'N/A',
                        product: item.orderItems?.length
                            ? item.orderItems.map((oi) => oi.productName).join(', ')
                            : 'N/A',
                        totalAmount: item.totalAmount ? item.totalAmount.toFixed(2) : '0.00',
                        status: item.status || 'Pending',
                        orderItems: item.orderItems || [],
                    }));
                    setOrders(transformed);
                    setTotalOrders(ordersRes.totalCount || ordersRes.data.length);

                    // Generate sales data from orders
                    const sales = aggregateSalesData(ordersRes.data, timePeriod);

                    setSalesData(sales);
                } else {
                    setOrders([]);
                    setTotalOrders(0);
                    setSalesData([]);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                showError('Failed to load dashboard data. Please try again.');
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchData();
    }, [dispatch, paginationModel, timePeriod, searchQuery]);

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    return (
        <Box
            sx={{
                p: {xs: 0, sm: 3, md: 3, lg: 4},
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

            {isLoading && (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress/>
                </Box>
            )}

            <Grid container spacing={8}>
                {/* Key Metrics Cards */}
                <Grid item size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                        lg: 2.4
                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Revenue
                            </Typography>
                            <MetricTypography>
                                {metrics?.totalRevenue
                                    ? new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    }).format(metrics.totalRevenue)
                                    : '$0.00'}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                        lg: 2.4
                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Products
                            </Typography>
                            <MetricTypography>
                                {metrics?.totalProducts || 0}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                        lg: 2.4
                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Average Order Value
                            </Typography>
                            <MetricTypography>
                                {metrics?.averageOrderValue
                                    ? new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    }).format(metrics.averageOrderValue)
                                    : '$0.00'}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                        lg: 2.4
                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Conversion Rate
                            </Typography>
                            <MetricTypography>
                                {(metrics?.conversionRate || 0).toFixed(2)}%
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                        lg: 2.4
                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Cart Abandonment
                            </Typography>
                            <MetricTypography sx={{color: '#b91c1c'}}>
                                {(metrics?.cartAbandonmentRate || 0).toFixed(2)}%
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>


                {/* Sales Over Time Chart */}
                <Grid item size={
                    {
                        xs: 12,

                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Sales Over Time
                                </Typography>
                                <Select
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </Box>
                            <Box sx={{height: 350, mt: 2}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={14}/>
                                        <YAxis stroke="#64748b" fontSize={14}/>
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
                                            strokeWidth="3"
                                            dot={{r: 5}}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Recent Orders Table */}
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 9

                    }
                }>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Recent Orders
                                </Typography>
                                <TextField
                                    label="Search by Order ID or Email"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    sx={{width: 300}}
                                    size="small"
                                />
                            </Box>
                            <Table
                                orderRows={orders}
                                orderColumns={orderColumns}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                rowCount={totalOrders}
                            />
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Customer Metrics */}
                <Grid item  size={
                    {
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }

                } style={{
                    textAlign: "center"
                }}>
                    <StyledCard sx={{mb: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                Total Orders
                            </Typography>
                            <MetricTypography sx={{color: '#15803d'}}>
                                {metrics?.totalOrders || 0}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                    <StyledCard sx={{mb: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                Total Customers
                            </Typography>
                            <MetricTypography sx={{color: '#15803d'}}>
                                {metrics?.newCustomers || 0}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                Returning Customers
                            </Typography>
                            <MetricTypography sx={{color: '#15803d'}}>
                                {metrics?.returningCustomers || 0}
                            </MetricTypography>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;