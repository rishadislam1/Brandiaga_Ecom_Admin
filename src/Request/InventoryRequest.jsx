import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const AddInventoryRequest = async (data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.post('/Inventory',data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const GetInventoryRequest = async ()=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get('/Inventory/all');

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const UpdateInventoryRequest = async (id, data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.put(`/Inventory/${id}`,data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const DeleteInventoryRequest = async (id)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.delete(`/Inventory/${id}`);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}