// src/Slicers/CategorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
    },
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        updateCategory: (state, action) => {
            const { id, name, parent } = action.payload;
            const index = state.categories.findIndex((cat) => cat.id === id);
            if (index !== -1) {
                state.categories[index] = { ...state.categories[index], name, parent };
            }
        },
        deleteCategory: (state, action) => {
            state.categories = state.categories.filter((cat) => cat.id !== action.payload);
        },
    },
});

export const { setCategories, addCategory, updateCategory, deleteCategory } = categorySlice.actions;
export default categorySlice.reducer;