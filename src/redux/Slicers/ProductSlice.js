// src/Slicers/CategorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
    },
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        addProducts: (state, action) => {
            state.products.push(action.payload);
        },
        updateProduct: (state, action) => {
            const { id, name, sku,price,discountPrice,categoryId } = action.payload;
            const index = state.products.findIndex((prod) => prod.id === id);
            if (index !== -1) {
                state.products[index] = { ...state.products[index], name, sku,price,discountPrice,categoryId };
            }
        },
        deleteProduct: (state, action) => {
            state.products = state.products.filter((prod) => prod.id !== action.payload);
        },
    },
});

export const { setProducts, addProducts, updateProduct, deleteProduct } = productSlice.actions;
export default productSlice.reducer;