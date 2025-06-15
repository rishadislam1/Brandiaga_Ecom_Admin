import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import store from "../redux/store.js";
import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";

import {showError} from "../Components/ToasterComponent.jsx";


export const LoginRequest = async (data) => {
    const axiosSecure = UseAxiosSecure(); // <-- call the hook/function
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.post('/Users/login',data);

        return res.data;
    } catch (error) {
        console.log("from err", error?.response?.data?.message)
        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
};