import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const AddUserRequest = async (data)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.post(`/Users/register`,data);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}


export const DeleteUsersRequest = async (userId)=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.delete(`/Users/${userId}`);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}


export const GetUsersRequest = async ()=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get(`/Users/all`);

        return res.data;
    } catch (error) {

        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}