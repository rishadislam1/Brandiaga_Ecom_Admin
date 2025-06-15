// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './Slicers/LoadingSlice.js';
import categoryReducer from './Slicers/CategorySlice.js';
import productReducer from './Slicers/ProductSlice.js';
import inventoryReducer from './Slicers/InventorySlice.js';
import userReducer from "./Slicers/UserSlice.js";
import BannerReducer from "./Slicers/BannerSlice.js";
import seoReducer from "./Slicers/SeoSlice.js";

export default configureStore({
    reducer: {
        loading: loadingReducer,
        categories: categoryReducer,
        products: productReducer,
        inventory: inventoryReducer,
        users: userReducer,
        banners: BannerReducer,
        seo: seoReducer
    },
});