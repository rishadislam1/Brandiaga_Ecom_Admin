import { createSlice } from '@reduxjs/toolkit';

const bannerSlice = createSlice({
    name: 'banners',
    initialState: {
        banners: [],
    },
    reducers: {
        setBanners: (state, action) => {
            state.banners = action.payload;
        },
        addBanner: (state, action) => {
            state.banners.push(action.payload);
        },
        updateBanner: (state, action) => {
            const index = state.banners.findIndex(banner => banner.realId === action.payload.realId);
            if (index !== -1) {
                state.banners[index] = action.payload;
            }
        },
        deleteBanner: (state, action) => {
            state.banners = state.banners.filter(banner => banner.id !== action.payload);
        },
    },
});

export const { setBanners, addBanner, updateBanner, deleteBanner } = bannerSlice.actions;
export default bannerSlice.reducer;