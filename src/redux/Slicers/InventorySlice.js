// src/Slicers/InventorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const inventorySlice = createSlice({
    name: 'inventory',
    initialState: {
        inventories: [],
    },
    reducers: {
        setInventories: (state, action) => {
            state.inventories = action.payload;
        },
        addInventory: (state, action) => {
            state.inventories.push(action.payload);
        },
        updateInventory: (state, action) => {
            const { id, productId, quantity } = action.payload;
            const index = state.inventories.findIndex((inv) => inv.id === id);
            if (index !== -1) {
                state.inventories[index] = { ...state.inventories[index], productId, quantity };
            }
        },
        deleteInventory: (state, action) => {
            state.inventories = state.inventories.filter((inv) => inv.id !== action.payload);
        },
    },
});

export const { setInventories, addInventory, updateInventory, deleteInventory } = inventorySlice.actions;
export default inventorySlice.reducer;