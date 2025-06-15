import axios from "axios";

export const baseURL = 'http://localhost:5147';
// Create axios instance
const axiosSecure = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
});

// Set default API key header
axiosSecure.defaults.headers.common['X-Api-Key'] = import.meta.env.VITE_API_KEY;

// Request interceptor: add Authorization token
axiosSecure.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.trim()}`;
        } else {
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: handle 401 Unauthorized
axiosSecure.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Check for specific message if needed
            const errorMessage = error.response.data?.Message || '';
            console.warn("Auth error:", errorMessage);

            // Clear localStorage or any auth state
            localStorage.removeItem('token');

            // Redirect to login page (adjust the route as needed)
            window.location.href = '/';

            // Optionally return a rejected promise to halt further processing
            return Promise.reject(new Error("Unauthorized. Redirecting to login."));
        }

        return Promise.reject(error);
    }
);

// Export hook-style usage
const UseAxiosSecure = () => {
    return axiosSecure;
};

export default UseAxiosSecure;
