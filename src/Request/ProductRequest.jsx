import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const AddProductRequest = async (data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.post('/Products',data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const GetProductsRequest = async ()=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get('/Products/all');

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const UpdateProductsRequest = async (id, data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.put(`/Products/${id}`,data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const DeleteProductsRequest = async (id)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.delete(`/Products/${id}`);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}