import { setLoading } from "../redux/Slicers/LoadingSlice.js";
import store from "../redux/store.js";
import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import { showError } from "../Components/ToasterComponent.jsx";

export const GetBannersRequest = async () => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('/banners');
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to fetch banners.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const GetBannerByIdRequest = async (bannerId) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get(`/banners/${bannerId}`);
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to fetch banner.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const AddBannerRequest = async (formData) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.post('/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to add banner.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const UpdateBannerRequest = async (bannerId, formData) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.put(`/banners/${bannerId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to update banner.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const DeleteBannerRequest = async (bannerId) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.delete(`/banners/${bannerId}`);
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to delete banner.");
    } finally {
        store.dispatch(setLoading(false));
    }
};