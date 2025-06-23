import UseAxiosSecure from "../hooks/useAxiosSecure.jsx";
import store from "../redux/store.js";
import {setLoading} from "../redux/Slicers/LoadingSlice.js";
import {showError} from "../Components/ToasterComponent.jsx";


export const GetReportsRequest = async () => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.get('/Analytics', {
            headers: { 'Authorization': 'Bearer your-token-here' }, // Replace with actual token handling
        });
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to fetch reports.");
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};

export const GenerateSalesReportRequest = async ({ startDate, endDate }) => {
    const axiosSecure = UseAxiosSecure();
    try {
        store.dispatch(setLoading(true));
        const res = await axiosSecure.post(
            `/Analytics/sales-report?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
            {},
            {
                headers: { 'Authorization': 'Bearer your-token-here' }, // Replace with actual token handling
            }
        );
        return res.data;
    } catch (error) {
        showError(error?.response?.data?.Message || "Failed to generate sales report.");
        throw error;
    } finally {
        store.dispatch(setLoading(false));
    }
};