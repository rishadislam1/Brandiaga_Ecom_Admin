import { setLoading } from "../redux/Slicers/LoadingSlice.js";
import store from "../redux/store.js";
import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import { showError } from "../Components/ToasterComponent.jsx";

export const GetSeoEntriesRequest = async () => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('seo');
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to fetch SEO entries.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const AddSeoRequest = async (data) => {
    const axiosSecure = UseAxiosSecure();
    try {

        store.dispatch(setLoading(true));
        const res = await axiosSecure.post('/seo', data);
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to add SEO entry.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const UpdateSeoRequest = async (id, data) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.put(`/seo/${id}`, data);
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to update SEO entry.");
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const DeleteSeoRequest = async (id) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.delete(`/seo/${id}`);
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to delete SEO entry.");
    } finally {
        store.dispatch(setLoading(false));
    }
};