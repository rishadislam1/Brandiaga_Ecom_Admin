import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import OrdersTable from '../Components/Table.jsx';
import { GetOrdersRequest, UpdateOrderRequest } from '../Request/OrderRequest.jsx';
import { showSuccess } from '../Components/ToasterComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import { setOrders, updateOrder } from '../redux/Slicers/OrderSlice.js';

const Orders = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.orders);
    const { isLoading } = useSelector((state) => state.loading);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const handleStatusChange = async (order, newStatus) => {
        dispatch(setLoading(true));
        try {
            const data = { status: newStatus };
            const result = await UpdateOrderRequest(order.realId, data);
            if (result?.status === 'Success') {
                showSuccess(result?.message);
                dispatch(updateOrder({ id: order.id, status: newStatus }));
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const orderColumns = [
        { field: 'id', headerName: 'SLNo', width: 80 },
        { field: 'orderId', headerName: 'Order ID', width: 200 },
        { field: 'userEmail', headerName: 'Customer Email', width: 200 },
        { field: 'totalAmount', headerName: 'Total Amount ($)', width: 120 },
        { field: 'orderDate', headerName: 'Order Date', width: 150 },
        {
            field: 'orderItems',
            headerName: 'Order Items',
            width: 300,
            renderCell: (params) => (
                <Box>
                    {params.row.orderItems.map((item, index) => (
                        <div key={index}>
                            {item.productName} (Qty: {item.quantity}, Price: ${item.unitPrice.toFixed(2)})
                        </div>
                    ))}
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <Select
                    value={params.row.status || 'Pending'}
                    onChange={(e) => handleStatusChange(params.row, e.target.value)}
                    disabled={isLoading}
                >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Shipped">Shipped</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
            ),
        },
    ];

    useEffect(() => {
        (async () => {
            try {
                dispatch(setLoading(true));
                const res = await GetOrdersRequest();
                if (res?.data?.length) {
                    const transformed = res.data.map((item, index) => ({
                        id: index + 1,
                        orderId: item.orderId || 'N/A',
                        userEmail: item.userEmail || 'N/A',
                        totalAmount: item.totalAmount ? item.totalAmount.toFixed(2) : '0.00',
                        orderDate: item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A',
                        orderItems: item.orderItems || [],
                        status: item.status || 'Pending',
                        realId: item.orderId,
                    }));
                    dispatch(setOrders(transformed));
                }
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch]);

    return (
        <Box sx={{ p: 4 }}>
            <OrdersTable
                title="Orders Management"
                orderRows={orders.map((row) => ({
                    ...row,
                    orderId: row.orderId || 'N/A',
                    userEmail: row.userEmail || 'N/A',
                    totalAmount: row.totalAmount || '0.00',
                    orderDate: row.orderDate || 'N/A',
                    orderItems: row.orderItems || [],
                    status: row.status || 'Pending',
                }))}
                orderColumns={orderColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />
        </Box>
    );
};

export default Orders;