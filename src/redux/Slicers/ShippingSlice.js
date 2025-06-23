import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    shippings: [],
};

const shippingSlice = createSlice({
    name: 'shippings',
    initialState,
    reducers: {
        setShippings: (state, action) => {
            state.shippings = action.payload;
        },
        addShipping: (state, action) => {
            state.shippings.push(action.payload);
        },
        updateShipping: (state, action) => {
            const index = state.shippings.findIndex((s) => s.id === action.payload.id);
            if (index !== -1) {
                state.shippings[index] = action.payload;
            }
        },
        deleteShipping: (state, action) => {
            state.shippings = state.shippings.filter((s) => s.id !== action.payload);
        },
    },
});

export const { setShippings, addShipping, updateShipping, deleteShipping } = shippingSlice.actions;
export default shippingSlice.reducer;