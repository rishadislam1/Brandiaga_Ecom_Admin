import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";

export const DashboardSummary = async ()=>{
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));

        const res = await axiosSecure.get('/Dashboard/summary');
        return res.data;
    } catch (error) {
        console.log("from err", error?.response?.data?.message)
        showError(error?.response?.data?.message || error?.response?.data?.Message);
    } finally {
        store.dispatch(setLoading(false));
    }
}