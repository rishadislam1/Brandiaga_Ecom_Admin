import { createSlice } from '@reduxjs/toolkit';

const seoSlice = createSlice({
    name: 'seo',
    initialState: {
        seoEntries: [],
    },
    reducers: {
        setSeoEntries: (state, action) => {
            state.seoEntries = action.payload;
        },
        addSeoEntry: (state, action) => {
            state.seoEntries.push(action.payload);
        },
        updateSeoEntry: (state, action) => {
            const index = state.seoEntries.findIndex(entry => entry.realId === action.payload.realId);
            if (index !== -1) {
                state.seoEntries[index] = action.payload;
            }
        },
        deleteSeoEntry: (state, action) => {
            state.seoEntries = state.seoEntries.filter(entry => entry.id !== action.payload);
        },
    },
});

export const { setSeoEntries, addSeoEntry, updateSeoEntry, deleteSeoEntry } = seoSlice.actions;
export default seoSlice.reducer;