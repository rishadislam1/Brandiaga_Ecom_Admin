import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const GetOrdersRequest = async () => {
    const axiosSecure = UseAxiosSecure(); // <-- call the hook/function
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get('/Orders/all');

        return res.data;
    } catch (error) {
        console.log("from err", error?.response?.data?.message)
        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const UpdateOrderRequest = async (orderid,data) => {
    const axiosSecure = UseAxiosSecure(); // <-- call the hook/function
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.put(`/Orders/${orderid}`,data);

        return res.data;
    } catch (error) {
        console.log("from err", error?.response?.data?.message)
        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
};