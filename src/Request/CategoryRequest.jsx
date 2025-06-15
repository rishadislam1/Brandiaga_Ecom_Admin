import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const AddCategoryRequest = async (data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.post('/Categories',data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const GetCategoriesRequest = async ()=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get('/Categories/all');

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const UpdateCategoriesRequest = async (id, data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.put(`/Categories/${id}`,data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}

export const DeleteCategoriesRequest = async (id)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.delete(`/Categories/${id}`);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}