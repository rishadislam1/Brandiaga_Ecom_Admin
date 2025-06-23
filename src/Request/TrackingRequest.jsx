import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import { setLoading } from "../redux/Slicers/LoadingSlice.js";
import { showError } from "../Components/ToasterComponent.jsx";

export const GetOrderTracking = async (orderNumber, email) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('/tracking/track', {
            params: { orderNumber, email },
        });
        if (!res.data.success || !res.data.data) {
            throw new Error(res.data.message || 'Failed to fetch tracking information');
        }
        return res.data.data;
    } catch (error) {
        showError(error.message || error?.response?.data?.message || 'Failed to fetch tracking information');
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const GetShippingsRequest = async () => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('/tracking');

        return res.data;
    } catch (error) {
        showError(error.message || error?.response?.data?.message || 'Failed to fetch shipping records');
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const AddShippingRequest = async (data) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.post('/tracking', data);
        if (!res.data.success) {
            throw new Error(res.data.message || 'Failed to add shipping record');
        }
        return res.data;
    } catch (error) {
        showError(error.message || error?.response?.data?.message || 'Failed to add shipping record');
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const UpdateShippingRequest = async (orderId, data) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.put(`/tracking/${orderId}`, data);
        if (!res.data.success) {
            throw new Error(res.data.message || 'Failed to update shipping record');
        }
        return res.data;
    } catch (error) {
        showError(error.message || error?.response?.data?.message || 'Failed to update shipping record');
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};




export const GetShippingMethodsRequest = async () => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('/ShippingMethod');

        return res.data;
    } catch (error) {
        showError(error.message || error?.response?.data?.message || 'Failed to fetch shipping methods');
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};