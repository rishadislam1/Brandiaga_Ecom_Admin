import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orders: [],
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        updateOrder: (state, action) => {
            const { id, status } = action.payload;
            const index = state.orders.findIndex((order) => order.id === id);
            if (index !== -1) {
                state.orders[index] = { ...state.orders[index], status };
            }
        },
    },
});

export const { setOrders, updateOrder } = orderSlice.actions;
export default orderSlice.reducer;