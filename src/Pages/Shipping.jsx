import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import {
    AddShippingRequest,

    GetShippingsRequest,
    UpdateShippingRequest,
    GetShippingMethodsRequest,
} from '../Request/TrackingRequest.jsx';
import { showSuccess } from '../Components/ToasterComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import {
    setShippings,
    addShipping,
    updateShipping,

} from '../redux/Slicers/ShippingSlice.js';
import { setOrders } from '../redux/Slicers/OrderSlice.js';
import {GetOrdersRequest} from "../Request/OrderRequest.jsx";

const Shipping = () => {
    const dispatch = useDispatch();
    const { shippings } = useSelector((state) => state.shippings);
    const { orders } = useSelector((state) => state.orders);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [shippingMethodId, setShippingMethodId] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [trackingEventStatus, setTrackingEventStatus] = useState('');
    const [trackingEventLocation, setTrackingEventLocation] = useState('');
    const [trackingEventDate, setTrackingEventDate] = useState('');
    const [shippingMethods, setShippingMethods] = useState([]);
    const [error, setError] = useState('');

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const shippingColumns = [
        { field: 'id', headerName: 'SLNo' },
        { field: 'orderNumber', headerName: 'Order Number' },
        { field: 'trackingNumber', headerName: 'Tracking Number' },
        { field: 'estimatedDelivery', headerName: 'Estimated Delivery' },
        { field: 'carrier', headerName: 'Carrier' },
        {
            field: 'actions',
            headerName: 'Actions',
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} aria-label="edit">
                        <EditIcon className="text-green-700" />
                    </IconButton>

                </>
            ),
        },
    ];

    useEffect(() => {
        (async () => {
            try {
                dispatch(setLoading(true));
                // Fetch orders
                const ordersRes = await GetOrdersRequest();
                if (ordersRes?.data?.length) {
                    dispatch(
                        setOrders(
                            ordersRes.data.map((order, index) => ({
                                id: index + 1,
                                orderId: order.orderId,
                                orderNumber: `B-${order.orderId}`,
                                status: order.status,
                            }))
                        )
                    );
                }
                // Fetch shipping methods
                const methodsRes = await GetShippingMethodsRequest();

                if (methodsRes?.data?.length) {

                    setShippingMethods(methodsRes.data);
                }

                // Fetch shippings
                const shippingsRes = await GetShippingsRequest();

                if (shippingsRes?.data.length) {
                    const transformed = shippingsRes.data.map((item, index) => ({
                        id: index + 1,
                        orderNumber: item.orderNumber,
                        trackingNumber: item.trackingNumber || 'N/A',
                        estimatedDelivery: item.estimatedDelivery
                            ? new Date(item.estimatedDelivery).toLocaleDateString()
                            : 'N/A',
                        carrier: item.carrier || 'N/A',
                        orderId: item.orderNumber.replace('B-', ''),
                        shippingMethodId:
                            shippingMethods.find((sm) => sm.name === item.carrier)?.shippingMethodId || '',
                        trackingEvents: item.trackingHistory.map((event) => ({
                            eventDate: event.date,
                            status: event.status,
                            location: event.location || null,
                        })),
                    }));
                    dispatch(setShippings(transformed));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                dispatch(setLoading(false));
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orderId || !shippingMethodId) {
            setError('Order and shipping method are required.');
            return;
        }

        dispatch(setLoading(true));
        try {
            const trackingEvents = trackingEventDate && trackingEventStatus
                ? [
                    {
                        eventDate: new Date(trackingEventDate).toISOString(),
                        status: trackingEventStatus,
                        location: trackingEventLocation || null,
                    },
                ]
                : [];

            if (selectedShipping) {
                // Update shipping
                const data = {
                    trackingNumber: trackingNumber || null,
                    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
                    trackingEvents,
                };
                const result = await UpdateShippingRequest(selectedShipping.orderId, data);
                if (result?.success) {
                    showSuccess(result?.message);
                    dispatch(
                        updateShipping({
                            id: selectedShipping.id,
                            orderNumber: selectedShipping.orderNumber,
                            trackingNumber: trackingNumber || 'N/A',
                            estimatedDelivery: estimatedDelivery
                                ? new Date(estimatedDelivery).toLocaleDateString()
                                : 'N/A',
                            carrier:
                                shippingMethods.find((sm) => sm.shippingMethodId === shippingMethodId)?.name ||
                                'N/A',
                            orderId,
                            shippingMethodId,
                            trackingEvents,
                        })
                    );
                }
            } else {
                // Add shipping
                const data = {
                    orderId,
                    shippingMethodId,
                    trackingNumber: trackingNumber || null,
                    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
                    trackingEvents,
                };
                const res = await AddShippingRequest(data);
                if (res?.success) {
                    showSuccess('Shipping Record Added Successfully');
                    const newShipping = {
                        id: shippings.length + 1,
                        orderNumber: `B-${orderId}`,
                        trackingNumber: trackingNumber || 'N/A',
                        estimatedDelivery: estimatedDelivery
                            ? new Date(estimatedDelivery).toLocaleDateString()
                            : 'N/A',
                        carrier:
                            shippingMethods.find((sm) => sm.shippingMethodId === shippingMethodId)?.name ||
                            'N/A',
                        orderId,
                        shippingMethodId,
                        trackingEvents,
                    };
                    dispatch(addShipping(newShipping));
                }
            }
        } catch (error) {
            setError(error.message || 'Failed to save shipping record.');
        } finally {
            dispatch(setLoading(false));
            setOrderId('');
            setShippingMethodId('');
            setTrackingNumber('');
            setEstimatedDelivery('');
            setTrackingEventStatus('');
            setTrackingEventLocation('');
            setTrackingEventDate('');
            setSelectedShipping(null);
            setModalOpen(false);
        }
    };

    const handleAddShipping = () => {
        setSelectedShipping(null);
        setOrderId('');
        setShippingMethodId('');
        setTrackingNumber('');
        setEstimatedDelivery('');
        setTrackingEventStatus('');
        setTrackingEventLocation('');
        setTrackingEventDate('');
        setError('');
        setModalOpen(true);
    };

    const handleEdit = (shipping) => {
        setSelectedShipping(shipping);
        setOrderId(shipping.orderId || '');
        setShippingMethodId(shipping.shippingMethodId || '');
        setTrackingNumber(shipping.trackingNumber === 'N/A' ? '' : shipping.trackingNumber || '');
        setEstimatedDelivery(
            shipping.estimatedDelivery && shipping.estimatedDelivery !== 'N/A'
                ? new Date(shipping.estimatedDelivery).toISOString().split('T')[0]
                : ''
        );
        setTrackingEventStatus(shipping.trackingEvents[0]?.status || '');
        setTrackingEventLocation(shipping.trackingEvents[0]?.location || '');
        setTrackingEventDate(
            shipping.trackingEvents[0]?.eventDate
                ? new Date(shipping.trackingEvents[0].eventDate).toISOString().slice(0, 16)
                : ''
        );
        setError('');
        setModalOpen(true);
    };



    const modalBody = (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    select
                    label="Order"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    margin="normal"
                    required
                    disabled={!!selectedShipping}
                >
                    <MenuItem value="">
                        <em>Select an order</em>
                    </MenuItem>
                    {orders
                        .filter(
                            (order) =>
                                !shippings.some((s) => s.orderId === order.orderId) ||
                                order.orderId === selectedShipping?.orderId
                        )
                        .map((order) => (
                            <MenuItem key={order.orderId} value={order.orderId}>
                                {order.orderNumber}
                            </MenuItem>
                        ))}
                </TextField>
                <TextField
                    fullWidth
                    select
                    label="Shipping Method"
                    value={shippingMethodId}
                    onChange={(e) => setShippingMethodId(e.target.value)}
                    margin="normal"
                    required
                >
                    <MenuItem value="">
                        <em>Select a method</em>
                    </MenuItem>
                    {shippingMethods.map((method) => (
                        <MenuItem key={method.shippingMethodId} value={method.shippingMethodId}>
                            {method.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Estimated Delivery"
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    fullWidth
                    label="Tracking Event Status"
                    value={trackingEventStatus}
                    onChange={(e) => setTrackingEventStatus(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Tracking Event Location"
                    value={trackingEventLocation}
                    onChange={(e) => setTrackingEventLocation(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Tracking Event Date"
                    type="datetime-local"
                    value={trackingEventDate}
                    onChange={(e) => setTrackingEventDate(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
                {error && <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {selectedShipping ? 'Update' : 'Add'} Shipping
                    </Button>
                </Box>
            </form>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="contained" onClick={handleAddShipping} sx={{ mb: 2 }} disabled={isLoading}>
                Add Shipping
            </Button>

            <OrdersTable
                title="Shipping Records"
                orderRows={shippings.map((row) => ({
                    ...row,
                    orderNumber: row.orderNumber || 'N/A',
                    trackingNumber: row.trackingNumber || 'N/A',
                    estimatedDelivery: row.estimatedDelivery || 'N/A',
                    carrier: row.carrier || 'N/A',
                }))}
                orderColumns={shippingColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />

            <InputModal
                title={selectedShipping ? 'Update Shipping' : 'Add Shipping'}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedShipping(null);
                    setOrderId('');
                    setShippingMethodId('');
                    setTrackingNumber('');
                    setEstimatedDelivery('');
                    setTrackingEventStatus('');
                    setTrackingEventLocation('');
                    setTrackingEventDate('');
                    setError('');
                }}
            >
                {modalBody}
            </InputModal>
        </Box>
    );
};

export default Shipping;